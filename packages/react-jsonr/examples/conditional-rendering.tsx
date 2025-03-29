import React, { useState } from 'react';
import { 
  renderNode, 
  transformJsonTree, 
  TransformVisitor, 
  isComponentNode, 
  createComponentNode,
  createFragment,
  JsonNode 
} from '../src';
import { createRegistry } from '../src';

// JSON definition with content that will be conditionally rendered
const jsonDefinition: JsonNode = {
  type: 'div',
  props: { className: 'app-container', style: { maxWidth: '800px', margin: '0 auto', padding: '20px' } },
  children: [
    {
      type: 'div',
      props: { className: 'header', style: { marginBottom: '30px' } },
      children: [
        {
          type: 'h1',
          children: 'Conditional Rendering Example'
        },
        {
          type: 'p',
          children: 'This example demonstrates how to conditionally render components based on state.'
        }
      ]
    },
    {
      type: 'div',
      props: { className: 'user-profile', id: 'user-section' },
      children: [
        {
          type: 'h2',
          children: 'User Profile'
        },
        {
          type: 'div',
          props: { className: 'profile-info' },
          children: [
            {
              type: 'p',
              props: { id: 'user-name' },
              children: 'Name: John Doe'
            },
            {
              type: 'p',
              props: { id: 'user-email' },
              children: 'Email: john@example.com'
            },
            {
              type: 'p',
              props: { id: 'user-role' },
              children: 'Role: User'
            }
          ]
        },
        {
          type: 'div',
          props: { className: 'admin-controls', id: 'admin-section' },
          children: [
            {
              type: 'h3',
              children: 'Admin Controls'
            },
            {
              type: 'p',
              children: 'These controls are only visible to administrators.'
            },
            {
              type: 'button',
              props: { className: 'admin-button' },
              children: 'Manage Users'
            },
            {
              type: 'button',
              props: { className: 'admin-button' },
              children: 'System Settings'
            }
          ]
        },
        {
          type: 'div',
          props: { className: 'premium-content', id: 'premium-section' },
          children: [
            {
              type: 'h3',
              children: 'Premium Content'
            },
            {
              type: 'p',
              children: 'This content is only available to premium subscribers.'
            },
            {
              type: 'div',
              props: { className: 'premium-features' },
              children: [
                {
                  type: 'ul',
                  children: [
                    {
                      type: 'li',
                      children: 'Advanced Analytics'
                    },
                    {
                      type: 'li',
                      children: 'Priority Support'
                    },
                    {
                      type: 'li',
                      children: 'Custom Themes'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// Component registry with HTML elements automatically included
const registry = createRegistry();

interface UserState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isPremium: boolean;
}

export default function ConditionalRenderingExample() {
  // User state to control what gets rendered
  const [userState, setUserState] = useState<UserState>({
    isLoggedIn: true,
    isAdmin: false,
    isPremium: false
  });
  
  const [renderedContent, setRenderedContent] = useState<React.ReactNode>(null);
  
  // Create a transform visitor that conditionally renders based on user state
  const createConditionalRenderingTransform = (state: UserState): TransformVisitor => ({
    enter(node, context) {
      if (isComponentNode(node)) {
        // Hide admin section for non-admins
        if (node.props?.id === 'admin-section' && !state.isAdmin) {
          return createFragment([]);
        }
        
        // Hide premium content for non-premium users
        if (node.props?.id === 'premium-section' && !state.isPremium) {
          // Replace with upgrade prompt
          return createComponentNode('div', { className: 'upgrade-prompt', style: { 
            padding: '15px', 
            backgroundColor: '#f8f9fa', 
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            marginTop: '20px'
          }}, [
            createComponentNode('h3', {}, 'Upgrade to Premium'),
            createComponentNode('p', {}, 'Upgrade your account to access premium features.'),
            createComponentNode('button', { 
              style: { 
                backgroundColor: '#ffc107', 
                color: '#212529', 
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }, 
              onClick: () => setUserState({...userState, isPremium: true})
            }, 'Upgrade Now')
          ]);
        }
        
        // Hide entire user section if not logged in
        if (node.props?.id === 'user-section' && !state.isLoggedIn) {
          return createComponentNode('div', { className: 'login-prompt' }, [
            createComponentNode('h2', {}, 'Login Required'),
            createComponentNode('p', {}, 'Please log in to view your profile.'),
            createComponentNode('button', { 
              style: { 
                backgroundColor: '#007bff', 
                color: 'white', 
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }, 
              onClick: () => setUserState({...userState, isLoggedIn: true})
            }, 'Log In')
          ]);
        }
        
        // Modify role text for admin users
        if (node.props?.id === 'user-role' && state.isAdmin) {
          return {
            ...node,
            children: 'Role: Administrator',
            props: {
              ...node.props,
              style: { 
                color: '#dc3545', 
                fontWeight: 'bold' 
              }
            }
          };
        }
      }
    }
  });
  
  // Update content whenever user state changes
  React.useEffect(() => {
    const updateContent = async () => {
      const conditionalTransform = createConditionalRenderingTransform(userState);
      
      const transformedContent = await transformJsonTree(
        jsonDefinition,
        [conditionalTransform]
      );
      
      setRenderedContent(renderNode(transformedContent, registry));
    };
    
    updateContent();
  }, [userState]);
  
  return (
    <div className="example-container">
      <div className="user-controls" style={{ marginBottom: '20px' }}>
        <h3>User State Controls</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            onClick={() => setUserState({...userState, isLoggedIn: !userState.isLoggedIn})}
            style={{ 
              padding: '8px 16px',
              backgroundColor: userState.isLoggedIn ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            {userState.isLoggedIn ? 'Logged In ✓' : 'Logged Out'}
          </button>
          
          <button 
            onClick={() => setUserState({...userState, isAdmin: !userState.isAdmin})}
            style={{ 
              padding: '8px 16px',
              backgroundColor: userState.isAdmin ? '#dc3545' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
            disabled={!userState.isLoggedIn}
          >
            {userState.isAdmin ? 'Admin ✓' : 'Regular User'}
          </button>
          
          <button 
            onClick={() => setUserState({...userState, isPremium: !userState.isPremium})}
            style={{ 
              padding: '8px 16px',
              backgroundColor: userState.isPremium ? '#ffc107' : '#6c757d',
              color: userState.isPremium ? '#212529' : 'white',
              border: 'none',
              borderRadius: '4px'
            }}
            disabled={!userState.isLoggedIn}
          >
            {userState.isPremium ? 'Premium ✓' : 'Free Tier'}
          </button>
        </div>
        
        <div className="state-display" style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <p>Current State:</p>
          <code>{JSON.stringify(userState, null, 2)}</code>
        </div>
      </div>
      
      <div className="rendered-content">
        {renderedContent || <div>Loading content...</div>}
      </div>
    </div>
  );
} 