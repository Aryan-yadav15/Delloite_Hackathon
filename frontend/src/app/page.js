'use client'
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Mail, Database, Cloud, Zap, CheckCircle2, Shield, LineChart, Box, Users, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'
import BlobBackground from '@/components/BlobBackground'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <BlobBackground />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 md:py-32 px-4">
        <div className="container mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-6">
              Revolutionize Your
              <span className="block mt-2 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
                Email Workflow
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              AI-powered email automation for manufacturers and retailers. 
              Process orders faster, reduce errors, and boost collaboration.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-lg transform transition hover:scale-105"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Start Free Trial
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                Watch Demo
              </Button>
            </div>
          </motion.div>

          <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto mt-20">
            <FeatureCard 
              icon={<Users className="h-8 w-8" />}
              title="500+"
              description="Manufacturers Connected"
              color="from-blue-500 to-violet-500"
            />
            <FeatureCard 
              icon={<Box className="h-8 w-8" />}
              title="1M+"
              description="Orders Processed"
              color="from-teal-400 to-blue-500"
            />
            <FeatureCard 
              icon={<Zap className="h-8 w-8" />}
              title="10x"
              description="Faster Processing"
              color="from-violet-400 to-blue-400"
            />
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            Powerful Integration Platform
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                whileHover={{ y: -10 }}
                className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
              >
                <div className={`mb-6 p-4 rounded-lg bg-gradient-to-r ${feature.color} w-fit`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Canvas Preview */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
              Visual Workflow Builder
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
              Drag-and-drop interface to create custom email processing workflows
            </p>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white dark:border-gray-800 bg-white dark:bg-gray-900">
              <img 
                src="/canvas-preview.png" 
                alt="Workflow Canvas" 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const FeatureCard = ({ icon, title, description, color }) => (
  <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
    <div className={`mb-4 p-3 rounded-lg bg-gradient-to-r ${color} w-fit`}>
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </div>
);

const features = [
  {
    icon: <Mail className="h-6 w-6 text-white" />,
    title: "AI Email Processing",
    description: "Automatically extract order details from emails using natural language processing",
    color: "from-blue-500 to-violet-500"
  },
  {
    icon: <Database className="h-6 w-6 text-white" />,
    title: "Real-time Sync",
    description: "Instant synchronization between manufacturers and retailers",
    color: "from-teal-400 to-blue-500"
  },
  {
    icon: <Shield className="h-6 w-6 text-white" />,
    title: "Bank-grade Security",
    description: "End-to-end encryption and compliance with industry standards",
    color: "from-violet-400 to-blue-400"
  },
  {
    icon: <Cloud className="h-6 w-6 text-white" />,
    title: "Cloud Native",
    description: "Access your data anywhere with our secure cloud infrastructure",
    color: "from-blue-400 to-teal-400"
  },
  {
    icon: <LineChart className="h-6 w-6 text-white" />,
    title: "Advanced Analytics",
    description: "Real-time insights into your order processing pipeline",
    color: "from-violet-500 to-blue-500"
  },
  {
    icon: <Zap className="h-6 w-6 text-white" />,
    title: "Automation Engine",
    description: "Create custom workflows with our visual automation builder",
    color: "from-teal-500 to-blue-400"
  }
];

