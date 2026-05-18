"use client";

import type { FC } from "react";
import { useState } from "react";
import { Button, Input, Textarea } from "@/components/ui";
import { Mail, Twitter, Linkedin, Send, Loader2 } from "lucide-react";

const Contact: FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    // Mock submission for now
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSent(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-100/30 overflow-x-hidden">
            <main className="relative pt-24 pb-24">
                {/* Background Elements */}
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-0 right-1/4 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.03),_transparent_70%)] blur-[100px]" />
                    <div className="absolute bottom-0 left-0 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,_rgba(16,185,129,0.05),_transparent_70%)] blur-[120px]" />
                </div>

                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">

                        {/* LEFT COLUMN: INFO */}
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <p className="text-xs uppercase tracking-[0.45em] text-zinc-400 font-semibold">
                                    Contact Us
                                </p>
                                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
                                    Let's start a <br />
                                    <span className="text-zinc-500">conversation.</span>
                                </h1>
                                <p className="text-lg text-zinc-400 max-w-md leading-relaxed">
                                    Have questions about the platform? Want to become a partner?
                                    Or just want to say hello? We are listening.
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-start gap-5 group">
                                    <div className="h-12 w-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/10 transition-colors">
                                        <Mail className="h-5 w-5 text-zinc-300 group-hover:text-emerald-300 transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Email Us</h3>
                                        <p className="text-zinc-400 text-sm mb-1">General Inquiries</p>
                                        <a href="mailto:officialtrodec@gmail.com" className="text-emerald-400 hover:text-emerald-300 transition-colors font-medium">officialtrodec@gmail.com</a>
                                    </div>
                                </div>

                            </div>

                            <div className="pt-8 border-t border-white/5">
                                <h4 className="text-sm font-semibold uppercase tracking-widest text-zinc-500 mb-6">Socials</h4>
                                <div className="flex gap-4">
                                    <a href="#" className="h-10 w-10 rounded-full border border-white/10 hover:bg-white text-zinc-400 hover:text-black flex items-center justify-center transition-all hover:-translate-y-1">
                                        <Twitter className="h-4 w-4" />
                                    </a>
                                    <a href="https://www.linkedin.com/company/trodec" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full border border-white/10 hover:bg-white text-zinc-400 hover:text-black flex items-center justify-center transition-all hover:-translate-y-1">
                                        <Linkedin className="h-4 w-4" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: FORM */}
                        <div className="lg:pt-8">
                            <div className="rounded-3xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md p-8 md:p-10 shadow-2xl">
                                {isSent ? (
                                    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center space-y-4 animate-fade-in-up">
                                        <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mb-4">
                                            <Send className="h-8 w-8 text-emerald-400" />
                                        </div>
                                        <h3 className="text-2xl font-bold">Message Sent!</h3>
                                        <p className="text-zinc-400 max-w-xs">
                                            Thanks for reaching out. We'll get back to you within 24 hours.
                                        </p>
                                        <Button
                                            variant="outline"
                                            className="mt-6 border-white/10 hover:bg-white/5"
                                            onClick={() => setIsSent(false)}
                                        >
                                            Send another
                                        </Button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300 ml-1">Full Name</label>
                                            <Input
                                                placeholder="Enter your name"
                                                className="h-12 bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300 ml-1">Email Address</label>
                                            <Input
                                                type="email"
                                                placeholder="name@example.com"
                                                className="h-12 bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl"
                                                required
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-zinc-300 ml-1">Message</label>
                                            <Textarea
                                                placeholder="How can we help?"
                                                className="min-h-[150px] bg-white/5 border-white/10 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl resize-none p-4"
                                                required
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl mt-4"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                "Send Message"
                                            )}
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default Contact;
