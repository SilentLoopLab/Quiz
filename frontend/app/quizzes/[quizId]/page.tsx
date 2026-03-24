import AppShell from "../../../components/navigation/AppShell";
import QuizPlayerPage from "../../../components/quizPlayer";

interface QuizPageProps {
    params: Promise<{
        quizId: string;
    }>;
}

export default async function QuizPage({ params }: QuizPageProps) {
    const { quizId } = await params;

    return (
        <AppShell>
            <QuizPlayerPage quizId={quizId} />
        </AppShell>
    );
}
