import AppShell from "../../../../../components/navigation/AppShell";
import QuizCreationPage from "../../../../../components/quizCreation";

interface EditQuizQuestionsPageProps {
    params: Promise<{
        quizId: string;
    }>;
}

export default async function EditQuizQuestionsPage({
    params,
}: EditQuizQuestionsPageProps) {
    const { quizId } = await params;

    return (
        <AppShell>
            <QuizCreationPage mode="edit" quizId={quizId} />
        </AppShell>
    );
}
