import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <h1>HomePage</h1>
      <Link href="/profile">Profile</Link>
    </div>
  );
}
