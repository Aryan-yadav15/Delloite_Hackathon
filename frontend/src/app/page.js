import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Mail, Database, Cloud, Zap, CheckCircle2, Shield, LineChart } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">
                  Transform Your Email <br />Processing Workflow
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Harness the power of AI to automate your bulk email processing. Save time, reduce errors, and boost productivity.
                </p>
              </div>
              <div className="space-x-4">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-2">
                  Watch Demo
                </Button>
              </div>
              <div className="flex items-center justify-center space-x-8 mt-8">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-gray-500">No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-gray-500">Enterprise-grade security</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-20 bg-white dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Powerful Features for Modern Businesses
              </h2>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                Everything you need to streamline your email processing workflow
              </p>
            </div>
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="group relative p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute -top-6 left-6">
                    <div className="p-3 bg-gradient-to-r from-blue-600 to-violet-600 rounded-xl">
                      {feature.icon}
                    </div>
                  </div>
                  <div className="pt-8">
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-20 bg-gray-50 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <h3 className="text-4xl font-bold text-blue-600">{stat.value}</h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 bg-gradient-to-r from-blue-600 to-violet-600">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center text-white">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Transform Your Workflow?
              </h2>
              <p className="max-w-[600px] text-gray-100 md:text-xl">
                Join thousands of businesses already using our platform
              </p>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 bg-white dark:bg-gray-900 border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 MailTrack Pro. All rights reserved.
            </p>
            <nav className="flex gap-6">
              <Link className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100" href="#">
                Terms
              </Link>
              <Link className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100" href="#">
                Privacy
              </Link>
              <Link className="text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100" href="#">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: <Mail className="h-6 w-6 text-white" />,
    title: "Smart Email Processing",
    description: "Automatically process and categorize thousands of emails with AI-powered intelligence."
  },
  {
    icon: <Zap className="h-6 w-6 text-white" />,
    title: "Lightning Fast",
    description: "Process emails 10x faster than manual methods with our optimized algorithms."
  },
  {
    icon: <Database className="h-6 w-6 text-white" />,
    title: "Secure Storage",
    description: "Enterprise-grade security with encrypted storage and automated backups."
  },
  {
    icon: <Cloud className="h-6 w-6 text-white" />,
    title: "Cloud Integration",
    description: "Seamlessly integrate with your existing cloud infrastructure and workflows."
  },
  {
    icon: <Shield className="h-6 w-6 text-white" />,
    title: "Advanced Security",
    description: "Enterprise-level security protocols and compliance measures built-in."
  },
  {
    icon: <LineChart className="h-6 w-6 text-white" />,
    title: "Analytics Dashboard",
    description: "Comprehensive insights and analytics to track your email processing metrics."
  }
]

const stats = [
  { value: "99.9%", label: "Accuracy Rate" },
  { value: "10x", label: "Faster Processing" },
  { value: "24/7", label: "Support Available" },
  { value: "100k+", label: "Emails Processed Daily" }
]

