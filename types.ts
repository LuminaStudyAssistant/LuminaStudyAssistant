
export type Subject = {
  id: string;
  name: string;
  color: string;
  folders: Folder[];
};

export type Folder = {
  id: string;
  subjectId: string;
  name: string;
  notes: Note[];
};

export type Note = {
  id: string;
  folderId: string;
  title: string;
  content: string;
  createdAt: string;
  summary?: string;
  flashcards?: Flashcard[];
};

export type Flashcard = {
  question: string;
  answer: string;
};

export type StudyEvent = {
  id: string;
  title: string;
  date: string;
  type: 'study' | 'exam' | 'deadline';
  subjectId?: string;
};

export type ChatMessage = {
  role: 'user' | 'model';
  text: string;
};
