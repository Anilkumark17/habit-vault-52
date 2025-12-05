-- Create subtasks table
CREATE TABLE public.subtasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subtasks ENABLE ROW LEVEL SECURITY;

-- RLS policy: Users can manage subtasks of their own tasks
CREATE POLICY "Users can manage subtasks of own tasks"
ON public.subtasks
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.tasks
        WHERE tasks.id = subtasks.task_id
        AND tasks.user_id = auth.uid()
    )
);

-- Enable realtime for subtasks
ALTER PUBLICATION supabase_realtime ADD TABLE public.subtasks;