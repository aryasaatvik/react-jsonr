import Link from 'next/link';
import { ArrowRight, Code, Layers, Zap } from 'lucide-react';
import { ReactNode } from 'react';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import GithubIcon from '@/components/github-icon';
import { renderNode } from 'react-jsonr';
import type { JsonNode, ComponentRegistry } from 'react-jsonr';

// Define the components that will be used in the JSON
const Avatar = ({ src, size }: { src: string; size: string }) => (
  <div className={`h-${size === 'large' ? '16' : '12'} w-${size === 'large' ? '16' : '12'} rounded-full p-2 bg-fd-primary/20 flex items-center justify-center`}>
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2"/>
      <path d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" stroke="currentColor" strokeWidth="2"/>
    </svg>
  </div>
);

const ProfileInfo = ({ name, role }: { name: string; role: string }) => (
  <div>
    <h3 className="font-medium">{name}</h3>
    <p className="text-fd-muted-foreground text-sm">{role}</p>
  </div>
);

// Create the component registry
const registry: ComponentRegistry = {
  div: 'div',
  h2: 'h2',
  Avatar,
  ProfileInfo
};

// Define the JSON structure with Tailwind classes directly
const userProfileJson: JsonNode = {
  type: 'div',
  props: { 
    className: 'bg-fd-card text-fd-card-foreground p-6 rounded-lg border border-fd-border' 
  },
  children: [
    {
      type: 'div',
      props: { className: 'flex items-center gap-4' },
      children: [
        {
          type: 'Avatar',
          props: { 
            src: '/avatar.png',
            size: 'large'
          }
        },
        {
          type: 'ProfileInfo',
          props: { 
            name: 'Jane Doe',
            role: 'Developer'
          }
        }
      ]
    }
  ]
};

export default async function HomePage() {
  const renderedProfile = renderNode(userProfileJson, registry);

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
              <GithubIcon />
              GitHub
            </Link>
            {/*  show a 1536x812 diagram of the library */}
            <ImageZoom src="/diagram.png" width={768} height={406} alt="React JSONR Diagram" />
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
                  code={JSON.stringify(userProfileJson, null, 2)} 
                />
              </div>
              <div className="flex justify-center">
                <ArrowRight size={24} className="rotate-90 md:rotate-0" />
              </div>
            </div>
            
            <div className="bg-fd-card text-fd-card-foreground p-6 rounded-lg border border-fd-border">
              {renderedProfile}
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
