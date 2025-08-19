import { useState } from "react"
import { Button } from "./button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card"
import { Textarea } from "./textarea"
import { Label } from "./label"
import { RadioGroup, RadioGroupItem } from "./radio-group"
import { MessageCircle, X, ThumbsUp, ThumbsDown, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface FeedbackWidgetProps {
  className?: string
}

export function FeedbackWidget({ className }: FeedbackWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [rating, setRating] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (!feedback.trim() || !rating) {
      toast({
        title: "Please provide feedback and rating",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Thank you for your feedback!",
        description: "Your feedback helps us improve the platform."
      })
      
      // Reset form
      setFeedback("")
      setRating("")
      setIsOpen(false)
    } catch (error) {
      toast({
        title: "Failed to submit feedback",
        description: "Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 z-40 rounded-full h-12 w-12 shadow-lg",
          className
        )}
        size="icon"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Card className={cn("fixed bottom-4 right-4 z-40 w-80 shadow-lg", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Send Feedback</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>How would you rate your experience?</Label>
          <RadioGroup value={rating} onValueChange={setRating}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="excellent" id="excellent" />
              <label htmlFor="excellent" className="flex items-center space-x-1 cursor-pointer">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">Excellent</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="good" id="good" />
              <label htmlFor="good" className="flex items-center space-x-1 cursor-pointer">
                <ThumbsUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">Good</span>
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="poor" id="poor" />
              <label htmlFor="poor" className="flex items-center space-x-1 cursor-pointer">
                <ThumbsDown className="h-4 w-4 text-red-500" />
                <span className="text-sm">Poor</span>
              </label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="feedback">Your feedback</Label>
          <Textarea
            id="feedback"
            placeholder="Tell us about your experience or suggest improvements..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setIsOpen(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !feedback.trim() || !rating}
        >
          {isSubmitting ? "Sending..." : "Send Feedback"}
        </Button>
      </CardFooter>
    </Card>
  )
}
