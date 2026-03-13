import "./globals.css";
import AuthSessionBootstrap from "../components/auth/AuthSessionBootstrap";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <AuthSessionBootstrap />
                {children}
            </body>
        </html>
    );
}
