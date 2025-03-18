"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Compass, Plus, ArrowLeft, ExternalLink, FileText, Video, LinkIcon, Book } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RoadmapDetailPage() {
    const params = useParams()
    const roadmapId = params.id as string

    const [steps, setSteps] = useState<any[]>([])
    const [openStepDialog, setOpenStepDialog] = useState(false)
    const [openResourceDialog, setOpenResourceDialog] = useState(false)
    const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null)

    const [stepTitle, setStepTitle] = useState("")
    const [stepDescription, setStepDescription] = useState("")

    const [resourceTitle, setResourceTitle] = useState("")
    const [resourceDescription, setResourceDescription] = useState("")
    const [resourceType, setResourceType] = useState("article")
    const [resourceUrl, setResourceUrl] = useState("")

    // Mock roadmap data
    const roadmap = {
        id: roadmapId,
        title: "Smart Contract Development",
        description:
            "Learn how to build secure and efficient smart contracts for Ethereum and other EVM-compatible chains.",
        createdAt: "2023-10-15",
    }

    const handleAddStep = (e: React.FormEvent) => {
        e.preventDefault()

        const newStep = {
            id: Date.now().toString(),
            title: stepTitle,
            description: stepDescription,
            resources: [],
        }

        setSteps([...steps, newStep])
        setStepTitle("")
        setStepDescription("")
        setOpenStepDialog(false)
    }

    const handleAddResource = (e: React.FormEvent) => {
        e.preventDefault()

        if (currentStepIndex === null) return

        const newResource = {
            id: Date.now().toString(),
            title: resourceTitle,
            description: resourceDescription,
            type: resourceType,
            url: resourceUrl,
        }

        const updatedSteps = [...steps]
        updatedSteps[currentStepIndex].resources.push(newResource)

        setSteps(updatedSteps)
        setResourceTitle("")
        setResourceDescription("")
        setResourceType("article")
        setResourceUrl("")
        setOpenResourceDialog(false)
    }

    const openAddResourceDialog = (stepIndex: number) => {
        setCurrentStepIndex(stepIndex)
        setOpenResourceDialog(true)
    }

    const getResourceIcon = (type: string) => {
        switch (type) {
            case "article":
                return <FileText className="h-4 w-4" />
            case "video":
                return <Video className="h-4 w-4" />
            case "tutorial":
                return <Book className="h-4 w-4" />
            case "tool":
                return <LinkIcon className="h-4 w-4" />
            default:
                return <FileText className="h-4 w-4" />
        }
    }

    return (
        <div className="flex flex-col min-h-[100dvh]">
            <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b">
                <div className="flex items-center gap-2">
                    <Compass className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">RoadmapDAO</span>
                </div>
                <nav className="flex gap-4 sm:gap-6">
                    <Link href="/" className="text-sm font-medium hover:underline underline-offset-4">
                        Home
                    </Link>
                    <Link href="/dashboard" className="text-sm font-medium hover:underline underline-offset-4">
                        Dashboard
                    </Link>
                </nav>
            </header>
            <main className="flex-1 container py-6 md:py-12">
                <div className="mb-6">
                    <Link
                        href="/dashboard"
                        className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{roadmap.title}</h1>
                            <p className="text-muted-foreground mt-1">{roadmap.description}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Roadmap Steps</h2>
                        <Dialog open={openStepDialog} onOpenChange={setOpenStepDialog}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Step
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={handleAddStep}>
                                    <DialogHeader>
                                        <DialogTitle>Add New Step</DialogTitle>
                                        <DialogDescription>
                                            Create a new step for your roadmap. Each step should represent a logical progression in the
                                            learning journey.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="step-title">Step Title</Label>
                                            <Input
                                                id="step-title"
                                                placeholder="e.g., Setting Up Your Development Environment"
                                                value={stepTitle}
                                                onChange={(e) => setStepTitle(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="step-description">Step Description</Label>
                                            <Textarea
                                                id="step-description"
                                                placeholder="Describe what learners will achieve in this step..."
                                                value={stepDescription}
                                                onChange={(e) => setStepDescription(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit">Add Step</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {steps.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/20">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                <Plus className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h2 className="mt-4 text-xl font-semibold">No steps yet</h2>
                            <p className="mt-2 text-center text-muted-foreground max-w-md">
                                Add your first step to begin building your roadmap. Each step should represent a logical progression in
                                the learning journey.
                            </p>
                            <Dialog open={openStepDialog} onOpenChange={setOpenStepDialog}>
                                <DialogTrigger asChild>
                                    <Button className="mt-4 gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Your First Step
                                    </Button>
                                </DialogTrigger>
                            </Dialog>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {steps.map((step, index) => (
                                <Card key={step.id}>
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                                {index + 1}
                                            </div>
                                            <CardTitle>{step.title}</CardTitle>
                                        </div>
                                        <CardDescription>{step.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Tabs defaultValue="resources">
                                            <TabsList>
                                                <TabsTrigger value="resources">Resources ({step.resources.length})</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="resources" className="pt-4">
                                                {step.resources.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center py-6 border rounded-lg bg-muted/20">
                                                        <p className="text-center text-muted-foreground">
                                                            No resources added yet. Add resources to help learners master this step.
                                                        </p>
                                                        <Button
                                                            variant="outline"
                                                            className="mt-4 gap-2"
                                                            onClick={() => openAddResourceDialog(index)}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                            Add Resource
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {step.resources.map((resource: any) => (
                                                            <div key={resource.id} className="flex items-start gap-3 p-3 border rounded-md">
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                                                                    {getResourceIcon(resource.type)}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="font-medium">{resource.title}</h4>
                                                                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                                                                    <a
                                                                        href={resource.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="mt-2 inline-flex items-center text-sm text-primary hover:underline"
                                                                    >
                                                                        Visit Resource
                                                                        <ExternalLink className="ml-1 h-3 w-3" />
                                                                    </a>
                                                                </div>
                                                                <div className="text-xs font-medium px-2 py-1 rounded-full bg-muted">
                                                                    {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <Button
                                                            variant="outline"
                                                            className="w-full gap-2"
                                                            onClick={() => openAddResourceDialog(index)}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                            Add Another Resource
                                                        </Button>
                                                    </div>
                                                )}
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                <Dialog open={openResourceDialog} onOpenChange={setOpenResourceDialog}>
                    <DialogContent>
                        <form onSubmit={handleAddResource}>
                            <DialogHeader>
                                <DialogTitle>Add Resource</DialogTitle>
                                <DialogDescription>Add a valuable resource to help learners master this step.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="resource-title">Resource Title</Label>
                                    <Input
                                        id="resource-title"
                                        placeholder="e.g., Introduction to Solidity"
                                        value={resourceTitle}
                                        onChange={(e) => setResourceTitle(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="resource-description">Resource Description</Label>
                                    <Textarea
                                        id="resource-description"
                                        placeholder="Briefly describe what this resource covers..."
                                        value={resourceDescription}
                                        onChange={(e) => setResourceDescription(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="resource-type">Resource Type</Label>
                                    <Select value={resourceType} onValueChange={setResourceType}>
                                        <SelectTrigger id="resource-type">
                                            <SelectValue placeholder="Select resource type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="article">Article</SelectItem>
                                            <SelectItem value="video">Video</SelectItem>
                                            <SelectItem value="tutorial">Tutorial</SelectItem>
                                            <SelectItem value="tool">Tool</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="resource-url">Resource URL</Label>
                                    <Input
                                        id="resource-url"
                                        placeholder="https://..."
                                        value={resourceUrl}
                                        onChange={(e) => setResourceUrl(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Add Resource</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </main>
            <footer className="border-t py-6 px-4 md:px-6">
                <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-center text-sm text-muted-foreground md:text-left">
                        &copy; {new Date().getFullYear()} RoadmapDAO. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    )
}