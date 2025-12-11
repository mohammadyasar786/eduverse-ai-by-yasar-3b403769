import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { BookOpen, Box, Play, Atom, Dna, Globe, X, RotateCcw } from "lucide-react";
import ARScene from "@/components/AR3DModels/ARScene";

type ModelType = "dna" | "atom" | "cell" | "math";

interface ARModule {
  id: ModelType;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const ARLearning = () => {
  const [activeModel, setActiveModel] = useState<ModelType | null>(null);

  const arModules: ARModule[] = [
    {
      id: "atom",
      icon: Atom,
      title: "Physics Lab",
      description: "Explore atomic structure with orbiting electrons in immersive 3D",
      color: "info"
    },
    {
      id: "cell",
      icon: Dna,
      title: "Biology 3D",
      description: "Dive into cellular structures and biological systems",
      color: "success"
    },
    {
      id: "dna",
      icon: Globe,
      title: "DNA Explorer",
      description: "Experience the double helix in stunning detail",
      color: "accent"
    },
    {
      id: "math",
      icon: Box,
      title: "Math Visualizer",
      description: "See mathematical functions come alive in 3D space",
      color: "primary"
    }
  ];

  const getModelTitle = (modelId: ModelType) => {
    const module = arModules.find(m => m.id === modelId);
    return module?.title || "";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-20 pb-8 px-4 container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-info/10 border border-info/20 text-info">
            <BookOpen className="h-4 w-4" />
            <span className="text-sm font-medium">AR-Teach 360</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold">
            Visualize Complex Concepts in{" "}
            <span className="bg-clip-text text-transparent gradient-primary">
              Interactive 3D
            </span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Transform abstract ideas into interactive 3D experiences. Rotate, zoom, and explore concepts in ways textbooks never could.
          </p>
        </div>

        {/* 3D Viewer Modal */}
        {activeModel && (
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{getModelTitle(activeModel)}</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setActiveModel(null)}>
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
              <div className="aspect-video rounded-xl border-2 overflow-hidden">
                <ARScene modelType={activeModel} />
              </div>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Click and drag to rotate • Scroll to zoom • Interactive 3D model
              </p>
            </div>
          </div>
        )}

        {/* Featured AR Experience */}
        <Card className="mb-12 overflow-hidden border-2">
          <div className="grid md:grid-cols-2">
            <div className="aspect-square md:aspect-auto bg-gradient-to-br from-info/20 via-primary/20 to-accent/20 relative">
              <div className="absolute inset-0">
                <ARScene modelType="dna" />
              </div>
            </div>
            <div className="p-8 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-2">DNA Structure Explorer</h3>
              <p className="text-muted-foreground mb-6">
                Experience the iconic double helix structure in stunning 3D detail. Watch the base pairs connect and understand how genetic information is stored.
              </p>
              <Button 
                size="lg" 
                className="gradient-primary text-primary-foreground shadow-primary w-fit"
                onClick={() => setActiveModel("dna")}
              >
                <Play className="h-4 w-4 mr-2" />
                Launch Full View
              </Button>
            </div>
          </div>
        </Card>

        {/* AR Modules Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Available AR Learning Modules</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {arModules.map((module, index) => (
              <Card 
                key={index} 
                className="overflow-hidden hover:shadow-elevation transition-all duration-300 hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/20 group"
                onClick={() => setActiveModel(module.id)}
              >
                <div className="aspect-video relative bg-gradient-to-br from-muted to-muted/50">
                  <ARScene modelType={module.id} />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className={`inline-flex p-2 rounded-lg bg-${module.color}/20 mb-2`}>
                      <module.icon className={`h-5 w-5 text-${module.color}`} />
                    </div>
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {module.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-info/5 border-2">
          <h2 className="text-2xl font-bold mb-6 text-center">How AR-Teach 360 Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="inline-flex p-4 rounded-xl gradient-primary shadow-primary">
                <span className="text-2xl text-primary-foreground font-bold">1</span>
              </div>
              <h3 className="font-semibold">Choose Your Topic</h3>
              <p className="text-sm text-muted-foreground">
                Select from our library of interactive 3D learning modules
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex p-4 rounded-xl gradient-info shadow-primary">
                <span className="text-2xl text-info-foreground font-bold">2</span>
              </div>
              <h3 className="font-semibold">Interact in 3D</h3>
              <p className="text-sm text-muted-foreground">
                Rotate, zoom, and explore concepts in stunning detail
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex p-4 rounded-xl gradient-accent shadow-accent">
                <span className="text-2xl text-accent-foreground font-bold">3</span>
              </div>
              <h3 className="font-semibold">Learn Deeply</h3>
              <p className="text-sm text-muted-foreground">
                Visual understanding leads to better retention and comprehension
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ARLearning;
