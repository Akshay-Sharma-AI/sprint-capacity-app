-- Function to initialize user in workspace (SECURITY DEFINER bypasses RLS)
-- All new users join the single shared team workspace.
-- First user to sign up becomes admin; everyone else becomes member.
CREATE OR REPLACE FUNCTION init_user_workspace(
  p_user_id UUID,
  p_email TEXT,
  p_full_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_workspace_id UUID;
  v_role TEXT;
BEGIN
  -- Get or create the single shared workspace
  SELECT id INTO v_workspace_id FROM workspaces LIMIT 1;

  IF v_workspace_id IS NULL THEN
    INSERT INTO workspaces (name, slug)
    VALUES ('Sprint Team', 'sprint-team')
    RETURNING id INTO v_workspace_id;
  END IF;

  -- First member is admin, rest are members
  IF EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = v_workspace_id) THEN
    v_role := 'member';
  ELSE
    v_role := 'admin';
  END IF;

  -- Add to workspace_members (idempotent)
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, p_user_id, v_role)
  ON CONFLICT (workspace_id, user_id) DO NOTHING;

  -- Create user profile (idempotent)
  INSERT INTO users (id, workspace_id, email, full_name, role, availability_status)
  VALUES (p_user_id, v_workspace_id, p_email, p_full_name, v_role, 'available')
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

  RETURN v_workspace_id;
END;
$$;

-- Allow anyone authenticated to call this function
GRANT EXECUTE ON FUNCTION init_user_workspace TO authenticated;

-- Missing RLS policies

-- Projects: update and delete
CREATE POLICY "Members can update projects in their workspace"
  ON projects FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and managers can delete projects"
  ON projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = projects.workspace_id
        AND user_id = auth.uid()
        AND role IN ('admin', 'manager')
    )
  );

-- Sprints: update and delete
CREATE POLICY "Members can update sprints in their workspace"
  ON sprints FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and managers can delete sprints"
  ON sprints FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = sprints.workspace_id
        AND user_id = auth.uid()
        AND role IN ('admin', 'manager')
    )
  );

-- Tasks: delete
CREATE POLICY "Users can delete their own tasks or if admin/manager"
  ON tasks FOR DELETE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = tasks.workspace_id
        AND user_id = auth.uid()
        AND role IN ('admin', 'manager')
    )
  );

-- Capacities: insert and update
CREATE POLICY "Members can insert capacities in their workspace"
  ON capacities FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Members can update capacities"
  ON capacities FOR UPDATE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = capacities.workspace_id
        AND user_id = auth.uid()
        AND role IN ('admin', 'manager')
    )
  );
