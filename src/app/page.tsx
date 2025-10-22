import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-gray-100 dark:bg-gray-800 px-4 py-2 md:px-6 md:py-3">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="#" className="flex items-center gap-2" prefetch={false}>
            <Logo />
            <span className="text-lg font-semibold">CondoMAX</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button asChild>
              <Link href="/condo">Login</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-gray-50 dark:bg-gray-900 py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Modernize Your Condo Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                CondoMAX is a comprehensive platform to streamline your condominium's operations. From finances and
                maintenance to resident communication, we've got you covered.
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/condo">Get Started</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Financials</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Track expenses, manage budgets, and generate financial reports with ease.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Incidents</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Report and track maintenance issues, ensuring timely resolution.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Communications</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Keep residents informed with announcements, newsletters, and a community forum.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Account Statement</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Provide residents with access to their account statements and online payment options.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-gray-100 dark:bg-gray-800 px-4 py-6 md:px-6">
        <div className="container mx-auto flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; 2024 CondoMAX. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:underline" prefetch={false}>
              Terms of Service
            </Link>
            <Link href="#" className="hover:underline" prefetch={false}>
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
