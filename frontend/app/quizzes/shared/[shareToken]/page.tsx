import AppShell from "../../../../components/navigation/AppShell";
import QuizPlayerPage from "../../../../components/quizPlayer";

interface SharedQuizPageProps {
    params: Promise<{
        shareToken: string;
    }>;
}

export default async function SharedQuizPage({
    params,
}: SharedQuizPageProps) {
    const { shareToken } = await params;

    return (
        <AppShell>
            <QuizPlayerPage shareToken={shareToken} />
        </AppShell>
    );
}
