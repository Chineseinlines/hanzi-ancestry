-- 003: Word Book (生字本)
-- User's personal study list — characters they want to learn/review.

CREATE TABLE public.wordbook (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  char TEXT NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, char)
);

CREATE INDEX idx_wordbook_user ON public.wordbook(user_id, added_at DESC);

ALTER TABLE public.wordbook ENABLE ROW LEVEL SECURITY;

-- Users manage their own wordbook
CREATE POLICY "Users manage own wordbook"
  ON public.wordbook FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Teachers/admins can view all
CREATE POLICY "Teachers view all wordbook"
  ON public.wordbook FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );
