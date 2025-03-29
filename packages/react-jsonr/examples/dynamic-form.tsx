import React, { useState } from 'react';
import { renderNode, transformJsonTree, isComponentNode, JsonNode, ComponentNode, createRegistry } from '../src';

// Initial form definition
const initialFormDefinition: ComponentNode = {
  type: 'form',
  props: { 
    className: 'dynamic-form',
    style: { 
      maxWidth: '500px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    onSubmit: (e: React.FormEvent) => e.preventDefault()
  },
  children: [
    {
      type: 'h2',
      children: 'Dynamic Form Example'
    },
    {
      type: 'div',
      props: { className: 'form-field' },
      children: [
        {
          type: 'label',
          props: { htmlFor: 'name' },
          children: 'Name:'
        },
        {
          type: 'input',
          props: {
            id: 'name',
            type: 'text',
            placeholder: 'Enter your name',
            style: {
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }
          }
        }
      ]
    },
    {
      type: 'div',
      props: { className: 'form-field', style: { marginTop: '15px' } },
      children: [
        {
          type: 'label',
          props: { htmlFor: 'email' },
          children: 'Email:'
        },
        {
          type: 'input',
          props: {
            id: 'email',
            type: 'email',
            placeholder: 'Enter your email',
            style: {
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }
          }
        }
      ]
    },
    {
      type: 'div',
      props: { className: 'actions', style: { marginTop: '20px' } },
      children: [
        {
          type: 'button',
          props: {
            type: 'submit',
            style: {
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '10px 15px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }
          },
          children: 'Submit'
        }
      ]
    }
  ]
};

// Component registry - HTML elements are now automatically included
const registry = createRegistry();

export default function DynamicFormExample() {
  const [formDefinition, setFormDefinition] = useState(initialFormDefinition);
  const [renderedForm, setRenderedForm] = useState<React.ReactNode>(null);
  const [formType, setFormType] = useState('simple');
  
  // Handle form element changes
  const addField = (fieldType: string) => {
    const newField: JsonNode = {
      type: 'div',
      props: { className: 'form-field', style: { marginTop: '15px' } },
      children: []
    };
    
    if (fieldType === 'text') {
      newField.children = [
        {
          type: 'label',
          props: { htmlFor: 'address' },
          children: 'Address:'
        },
        {
          type: 'input',
          props: {
            id: 'address',
            type: 'text',
            placeholder: 'Enter your address',
            style: {
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }
          }
        }
      ];
    } else if (fieldType === 'select') {
      newField.children = [
        {
          type: 'label',
          props: { htmlFor: 'country' },
          children: 'Country:'
        },
        {
          type: 'select',
          props: {
            id: 'country',
            style: {
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }
          },
          children: [
            {
              type: 'option',
              props: { value: '' },
              children: 'Select a country'
            },
            {
              type: 'option',
              props: { value: 'us' },
              children: 'United States'
            },
            {
              type: 'option',
              props: { value: 'ca' },
              children: 'Canada'
            },
            {
              type: 'option',
              props: { value: 'uk' },
              children: 'United Kingdom'
            }
          ]
        }
      ];
    } else if (fieldType === 'textarea') {
      newField.children = [
        {
          type: 'label',
          props: { htmlFor: 'message' },
          children: 'Message:'
        },
        {
          type: 'textarea',
          props: {
            id: 'message',
            rows: 4,
            placeholder: 'Enter your message',
            style: {
              width: '100%',
              padding: '8px',
              marginTop: '5px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }
          }
        }
      ];
    }
    
    // Clone the form definition and add the new field
    setFormDefinition((prevDef) => {
      if (isComponentNode(prevDef)) {
        return {
          ...prevDef,
          children: [
            ...(Array.isArray(prevDef.children) ? prevDef.children : [prevDef.children]),
            newField
          ]
        };
      }
      return prevDef;
    });
  };
  
  // Switch between form types
  const switchFormType = async (type: string) => {
    setFormType(type);
    
    if (type === 'simple') {
      setFormDefinition(initialFormDefinition);
    } else if (type === 'contact') {
      // Create a contact form with additional fields
      const contactForm: JsonNode = { ...initialFormDefinition };
      
      // Add a message textarea
      if (isComponentNode(contactForm)) {
        const messageField: JsonNode = {
          type: 'div',
          props: { className: 'form-field', style: { marginTop: '15px' } },
          children: [
            {
              type: 'label',
              props: { htmlFor: 'message' },
              children: 'Message:'
            },
            {
              type: 'textarea',
              props: {
                id: 'message',
                rows: 4,
                placeholder: 'Enter your message',
                style: {
                  width: '100%',
                  padding: '8px',
                  marginTop: '5px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }
              }
            }
          ]
        };
        
        const titleNode = {
          type: 'h2',
          children: 'Contact Form'
        };
        
        // Update the title and add the message field
        contactForm.children = Array.isArray(contactForm.children) 
          ? [titleNode, ...contactForm.children.slice(1), messageField]
          : [titleNode, messageField];
          
        setFormDefinition(contactForm);
      }
    }
  };
  
  // Render the form whenever the definition changes
  React.useEffect(() => {
    const updateRenderedForm = async () => {
      // Add input handlers to make inputs work
      const transformedForm = await transformJsonTree(formDefinition, [{
        enter(node, context) {
          if (isComponentNode(node) && (node.type === 'input' || node.type === 'textarea' || node.type === 'select')) {
            return {
              ...node,
              props: {
                ...node.props,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                  console.log(`Value changed: ${e.target.value}`);
                }
              }
            };
          }
        }
      }]);
      
      setRenderedForm(renderNode(transformedForm, registry));
    };
    
    updateRenderedForm();
  }, [formDefinition]);
  
  return (
    <div className="example-container">
      <h1>Dynamic Form Example</h1>
      <div className="example-description">
        <p>This example demonstrates how to create and modify form structures dynamically.</p>
      </div>
      
      <div className="form-controls" style={{ marginBottom: '20px' }}>
        <h3>Form Controls</h3>
        <div style={{ marginBottom: '10px' }}>
          <button 
            onClick={() => switchFormType('simple')}
            style={{ 
              marginRight: '10px', 
              padding: '8px 12px',
              backgroundColor: formType === 'simple' ? '#4CAF50' : '#f1f1f1',
              color: formType === 'simple' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Simple Form
          </button>
          <button 
            onClick={() => switchFormType('contact')}
            style={{ 
              padding: '8px 12px',
              backgroundColor: formType === 'contact' ? '#4CAF50' : '#f1f1f1',
              color: formType === 'contact' ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Contact Form
          </button>
        </div>
        
        <div>
          <p>Add field:</p>
          <button 
            onClick={() => addField('text')}
            style={{ marginRight: '10px', padding: '5px 10px' }}
          >
            Text Input
          </button>
          <button 
            onClick={() => addField('select')}
            style={{ marginRight: '10px', padding: '5px 10px' }}
          >
            Select Menu
          </button>
          <button 
            onClick={() => addField('textarea')}
            style={{ padding: '5px 10px' }}
          >
            Textarea
          </button>
        </div>
      </div>
      
      <div className="rendered-form">
        {renderedForm || <div>Loading form...</div>}
      </div>
      
      <div className="json-preview" style={{ marginTop: '30px' }}>
        <h3>Current Form JSON</h3>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '4px',
          overflow: 'auto',
          maxHeight: '300px'
        }}>
          {JSON.stringify(formDefinition, null, 2)}
        </pre>
      </div>
    </div>
  );
} 