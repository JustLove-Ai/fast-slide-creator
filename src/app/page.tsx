import Link from "next/link"
import { QuickStart } from "@/components/home/quick-start"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Target, Presentation, Palette } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Quick Start Section */}
        <section className="mb-20">
          <QuickStart />
        </section>

        {/* Why Choose FastSlides */}
        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose FastSlides?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
            No more starting from blank slides. Just share your ideas and let AI do the heavy lifting.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Lightbulb className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                <CardTitle>Smart Content</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  AI transforms your raw ideas into structured, professional presentation content
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Target className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <CardTitle>Auto Context</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Automatically creates audience-specific content based on who you're presenting to
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Presentation className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                <CardTitle>Framework Magic</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Choose proven presentation frameworks (CUB, PASE, HEAR) for maximum impact
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Palette className="h-12 w-12 mx-auto text-orange-600 mb-4" />
                <CardTitle>Hybrid Canvas</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Interactive slides with drawing tools for real-time collaboration and annotation
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Content Frameworks - Optional Learning */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Content Frameworks (Optional)
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Choose a framework to structure your content, or let AI pick the best one for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <CardTitle className="text-blue-600">CUB Framework</CardTitle>
                </div>
                <CardDescription>Contrarian - Useful - Bridge</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>Contrarian:</strong> Challenge assumptions</div>
                <div><strong>Useful:</strong> Provide practical value</div>
                <div><strong>Bridge:</strong> Connect to bigger picture</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <CardTitle className="text-green-600">PASE Framework</CardTitle>
                </div>
                <CardDescription>Problem - Agitate - Solve - Expand</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>Problem:</strong> Identify the issue</div>
                <div><strong>Agitate:</strong> Show consequences</div>
                <div><strong>Solve:</strong> Present solution</div>
                <div><strong>Expand:</strong> Scale the impact</div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <CardTitle className="text-purple-600">HEAR Framework</CardTitle>
                </div>
                <CardDescription>Hook - Empathy - Authority - Roadmap</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><strong>Hook:</strong> Grab attention</div>
                <div><strong>Empathy:</strong> Show understanding</div>
                <div><strong>Authority:</strong> Build credibility</div>
                <div><strong>Roadmap:</strong> Guide next steps</div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
