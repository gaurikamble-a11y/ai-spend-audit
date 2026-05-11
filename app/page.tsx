import SpendAuditForm from "@/components/ui/SpendAuditForm";
import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CheckCircle,
  ChevronRight,
  DollarSign,
  Quote,
  Shield,
  Zap,
  Activity,
  Layers,
  Key
} from "lucide-react";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-[#000000]">
      {/* Background gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-white">AuditAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
            <Link href="#testimonials" className="hover:text-white transition-colors">Testimonials</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Button className="hidden sm:flex rounded-full bg-white text-black hover:bg-gray-200">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 pt-24">
        {/* Hero Section */}
        <SpendAuditForm />
        <section className="container mx-auto px-4 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-sm text-gray-300 mb-8 backdrop-blur-sm animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            <span>AuditAI is now in public beta</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-white via-white to-gray-500 bg-clip-text text-transparent max-w-4xl mx-auto leading-[1.1]">
            Stop burning money on <br className="hidden md:block" /> AI API calls.
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Identify wasted tokens, overlapping models, and rogue API keys across your organization. Connect your OpenAI, Anthropic, and Azure accounts in 2 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Shield className="h-4 w-4 text-gray-500" />
              </div>
              <Input 
                type="email" 
                placeholder="Enter your work email" 
                className="pl-10 h-12 w-full rounded-full border-white/20 bg-white/5 focus-visible:ring-indigo-500 text-white"
              />
            </div>
            <Button size="lg" className="w-full sm:w-auto h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white border-0 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]">
              Start free audit <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <p className="mt-4 text-xs text-gray-500">No credit card required. 14-day free trial.</p>
        </section>

        {/* Dashboard Preview Section */}
        <section className="container mx-auto px-4 pb-24">
          <div className="relative max-w-5xl mx-auto rounded-xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-sm overflow-hidden transform perspective-1000 rotate-x-2 scale-95 hover:scale-100 hover:rotate-x-0 transition-all duration-700 ease-out">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
            
            {/* Mock Dashboard Header */}
            <div className="h-12 border-b border-white/5 flex items-center px-4 gap-4 bg-white/5">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-6 w-64 bg-black/50 rounded text-xs flex items-center justify-center text-gray-500 border border-white/5">
                  app.auditai.com/dashboard
                </div>
              </div>
            </div>

            {/* Mock Dashboard Content */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2 space-y-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-lg font-medium text-white">Monthly AI Spend</h3>
                    <p className="text-sm text-gray-400">vs last month</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-3xl font-bold text-white">$14,230.50</h2>
                    <p className="text-sm text-green-400 flex items-center justify-end"><ArrowRight className="w-3 h-3 mr-1 rotate-45" /> 12% optimized</p>
                  </div>
                </div>
                {/* Mock Chart */}
                <div className="h-48 w-full flex items-end gap-2 pt-8">
                  {[40, 60, 45, 80, 55, 90, 75, 100, 85, 110, 95, 120].map((h, i) => (
                    <div key={i} className="flex-1 bg-indigo-500/20 hover:bg-indigo-500/40 transition-colors rounded-t-sm relative group">
                      <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-purple-500 rounded-t-sm transition-all duration-500 group-hover:opacity-80" 
                        style={{ height: `${h}%` }} 
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Top Savings Opportunities</h3>
                {[
                  { icon: Zap, title: "Switch to GPT-4o-mini", saving: "$2,400/mo", desc: "For background tasks" },
                  { icon: Layers, title: "Deduplicate Prompts", saving: "$850/mo", desc: "Caching layer recommended" },
                  { icon: Key, title: "Unused API Keys", saving: "$320/mo", desc: "3 legacy keys found" }
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-md bg-white/5 group-hover:bg-indigo-500/20 transition-colors">
                        <item.icon className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-200">{item.title}</h4>
                      </div>
                      <span className="text-sm font-semibold text-green-400">{item.saving}</span>
                    </div>
                    <p className="text-xs text-gray-500 pl-11">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-black/50 border-y border-white/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">Complete visibility into your AI infrastructure</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">We analyze every API request, token generated, and dollar spent to give you actionable insights.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: BarChart3,
                  title: "Token Optimization",
                  description: "Identify overly verbose system prompts and redundant context windows that are unnecessarily inflating your costs."
                },
                {
                  icon: Activity,
                  title: "Model Downgrade Detection",
                  description: "Automatically detect which tasks can be routed to cheaper models (like Haiku or GPT-4o-mini) with zero drop in accuracy."
                },
                {
                  icon: Shield,
                  title: "Rogue Key Detection",
                  description: "Find and disable orphaned API keys from past hackathons and departed employees that are still racking up charges."
                }
              ].map((feature, idx) => (
                <Card key={idx} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors group">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6 text-indigo-400" />
                    </div>
                    <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-white mb-16">Trusted by fast-growing engineering teams</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  quote: "AuditAI found a misconfigured cron job that was calling GPT-4 every minute. It paid for itself in the first 10 minutes of use.",
                  author: "Sarah Chen",
                  role: "CTO, DataFlow",
                  initials: "SC"
                },
                {
                  quote: "The ability to see token usage across different models and teams allowed us to finally allocate our AI budget accurately.",
                  author: "Marcus Rodriguez",
                  role: "VP Engineering, Synapse",
                  initials: "MR"
                },
                {
                  quote: "We reduced our Anthropic bill by 40% just by implementing the caching recommendations AuditAI suggested.",
                  author: "Alex Kim",
                  role: "Lead Developer, ChatGen",
                  initials: "AK"
                }
              ].map((testimonial, i) => (
                <Card key={i} className="bg-transparent border-white/10">
                  <CardContent className="pt-6">
                    <Quote className="w-8 h-8 text-indigo-500/40 mb-4" />
                    <p className="text-gray-300 mb-6 relative z-10 leading-relaxed">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-sm font-medium text-white border border-white/10">
                        {testimonial.initials}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{testimonial.author}</div>
                        <div className="text-xs text-gray-500">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/5" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to stop overpaying for AI?</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Join hundreds of companies that have optimized their AI infrastructure and reduced their bills by an average of 35%.
            </p>
            <Button size="lg" className="rounded-full bg-white text-black hover:bg-gray-200 h-14 px-8 text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              Get Started for Free
            </Button>
            <p className="mt-6 text-sm text-gray-500 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" /> Takes 2 minutes to set up
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-black py-12 relative z-10">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-500" />
            <span className="font-semibold text-white tracking-tight">AuditAI</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact Support</Link>
          </div>
          
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} AuditAI Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
