"use client"

import {
  Button,
  Input,
  Textarea,
  Select,
  Checkbox,
  Card,
  Badge,
} from "@/components/ui"

import { useToast } from "@/hooks/use-toast"
import { Search } from "lucide-react"

export default function UITestPage() {
  const { showToast } = useToast()

  return (
    <div className="min-h-screen bg-muted/40 p-8">
      <div className="mx-auto max-w-3xl space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">UI Components Test</h1>
          <p className="text-muted-foreground">
            Testing all reusable UI components & toast notifications
          </p>
        </div>

        {/* Buttons */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Buttons</h2>

          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>

          <div className="flex gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
        </Card>

        {/* Inputs */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Inputs</h2>

          <Input
            label="Email"
            placeholder="Enter your email"
          />

          <Input
            label="Password"
            type="password"
            error="Password is required"
          />

          <Input
            label="Search"
            placeholder="Search..."
            icon={<Search className="h-4 w-4" />}
          />
        </Card>

        {/* Textarea */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Textarea</h2>

          <Textarea
            label="Description"
            placeholder="Write something..."
          />

          <Textarea
            label="Bio"
            error="Bio cannot be empty"
          />
        </Card>

        {/* Select + Checkbox */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Select & Checkbox</h2>

          <Select>
            <option value="">Select role</option>
            <option>User</option>
            <option>Admin</option>
          </Select>

          <Checkbox />
          <span className="ml-2 text-sm">Accept terms and conditions</span>
        </Card>

        {/* Card + Badge */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Card & Badge</h2>

          <div className="flex gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="destructive">Reported</Badge>
          </div>
        </Card>

        {/* Toast Tests */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Toast Notifications</h2>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => showToast("Success!", "success")}>
              Success Toast
            </Button>

            <Button
              variant="destructive"
              onClick={() => showToast("Error occurred", "error")}
            >
              Error Toast
            </Button>

            <Button
              variant="secondary"
              onClick={() => showToast("Info message", "info")}
            >
              Info Toast
            </Button>
          </div>
        </Card>

      </div>
    </div>
  )
}
