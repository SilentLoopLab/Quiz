import AppShell from "../../../../components/navigation/AppShell";
import QuizBuilderPage from "../../../../components/quizBuilder";

interface EditQuizPageProps {
    params: Promise<{
        quizId: string;
    }>;
}

export default async function EditQuizPage({ params }: EditQuizPageProps) {
    const { quizId } = await params;

    return (
        <AppShell>
            <QuizBuilderPage mode="edit" quizId={quizId} />
        </AppShell>
    );
}
