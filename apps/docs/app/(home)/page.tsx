import Link from 'next/link';
import { ArrowRight, Code, Layers, Zap } from 'lucide-react';
import { ReactNode } from 'react';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center py-12 px-4">
      <div className="max-w-5xl w-full space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            React JSONR
          </h1>
          <p className="text-xl text-fd-muted-foreground max-w-2xl mx-auto">
            Transform JSON into React components with a powerful, extensible library
            for building dynamic UI from declarative definitions.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href="/docs" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-fd-primary text-fd-primary-foreground hover:bg-fd-primary/90"
            >
              Get Started <ArrowRight size={16} />
            </Link>
            <Link 
              href="https://github.com/aryasaatvik/react-jsonr"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-fd-border hover:bg-fd-accent"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </Link>
          </div>
        </section>
        
        {/* Features */}
        <section className="space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Code />}
              title="JSON-to-React Conversion"
              description="Transform a JSON description of a UI into a fully-rendered React element tree."
            />
            <FeatureCard 
              icon={<Layers />}
              title="Plugin-Based Transformation"
              description="Insert plugins to mutate, enrich, or validate the JSON tree before rendering."
            />
            <FeatureCard 
              icon={<Zap />}
              title="Flexible & Optimized"
              description="Configurable traversal orders with support for caching and skipping unnecessary nodes."
            />
          </div>
        </section>
        
        {/* Code Example */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center">Quick Example</h2>
          <div className="bg-fd-card text-fd-card-foreground p-4 rounded-lg border border-fd-border overflow-auto">
            <DynamicCodeBlock 
              lang="tsx" 
              code={`import { renderNode, transformJsonTree } from 'react-jsonr';

// Define component registry
const registry = {
  Form: MyFormComponent,
  Input: MyInputComponent,
  Button: MyButtonComponent,
};

// JSON definition
const jsonDefinition = {
  type: 'Form',
  props: { title: 'Contact Us' },
  children: [
    { 
      type: 'Input',
      props: { name: 'email', label: 'Email' }
    },
    { 
      type: 'Button',
      props: { label: 'Submit', onClick: 'submitForm' }
    }
  ]
};

// Render component
const element = renderNode(jsonDefinition, registry, { 
  eventHandlers: { submitForm: () => console.log('Submitted!') }
});`} 
            />
          </div>
          <div className="text-center">
            <Link 
              href="/docs" 
              className="inline-flex items-center gap-1 text-fd-primary hover:underline"
            >
              Read the full documentation <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        
        {/* Visual Transformation Example */}
        <section className="space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
              <div className="bg-fd-card text-fd-card-foreground p-4 rounded-lg border border-fd-border overflow-auto md:flex-1">
                <DynamicCodeBlock 
                  lang="json" 
                  code={`{
  "type": "div",
  "props": { 
    "className": "card" 
  },
  "children": [
    {
      "type": "h2",
      "props": { "className": "title" },
      "children": "User Profile"
    },
    {
      "type": "div",
      "props": { "className": "content" },
      "children": [
        {
          "type": "Avatar",
          "props": { 
            "src": "/avatar.png",
            "size": "large"
          }
        },
        {
          "type": "ProfileInfo",
          "props": { 
            "name": "Jane Doe",
            "role": "Developer"
          }
        }
      ]
    }
  ]
}`} 
                />
              </div>
              <div className="flex justify-center">
                <ArrowRight size={24} className="rotate-90 md:rotate-0" />
              </div>
            </div>
            
            <div className="bg-fd-card text-fd-card-foreground p-6 rounded-lg border border-fd-border">
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">User Profile</h2>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-fd-primary/20 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium">Jane Doe</h3>
                    <p className="text-fd-muted-foreground text-sm">Developer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="bg-fd-card text-fd-card-foreground p-6 rounded-lg border border-fd-border flex flex-col gap-4">
      <div className="h-10 w-10 rounded-md bg-fd-primary/10 text-fd-primary flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-fd-muted-foreground">{description}</p>
    </div>
  );
}
