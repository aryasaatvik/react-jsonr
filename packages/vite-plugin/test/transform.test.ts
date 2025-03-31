import { describe, it, expect } from 'vitest';
import { transformJsxToJson } from '../src/transform';

describe('transformJsxToJson', () => {
  it('should transform simple JSX to JSON', () => {
    const input = `
      <div className="container">
        <h1>Hello World</h1>
        <p>This is a test</p>
      </div>
    `;

    const result = transformJsxToJson(input, 'test.tsx');
    const json = JSON.parse(result.code);

    expect(json).toEqual({
      type: 'div',
      props: {
        className: 'container',
      },
      children: [
        {
          type: 'h1',
          props: {},
          children: ['Hello World'],
        },
        {
          type: 'p',
          props: {},
          children: ['This is a test'],
        },
      ],
    });
  });

  it('should handle nested JSX elements', () => {
    const input = `
      <div>
        <header>
          <nav>
            <a href="/">Home</a>
          </nav>
        </header>
      </div>
    `;

    const result = transformJsxToJson(input, 'test.tsx');
    const json = JSON.parse(result.code);

    expect(json).toEqual({
      type: 'div',
      props: {},
      children: [
        {
          type: 'header',
          props: {},
          children: [
            {
              type: 'nav',
              props: {},
              children: [
                {
                  type: 'a',
                  props: {
                    href: '/',
                  },
                  children: ['Home'],
                },
              ],
            },
          ],
        },
      ],
    });
  });
}); 