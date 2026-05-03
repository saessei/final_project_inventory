import React from 'react';
import type { Preview } from '@storybook/react-vite'
import '../src/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    backgrounds: {
      default: 'cream',
      values: [
        { name: 'cream', value: '#fff8f0' },
        { name: 'white', value: '#ffffff' },
      ],
    },
    a11y: {
      test: "todo"
    }
  },
  decorators: [
    (Story, context) => {
      const isFullscreen = context.parameters.layout === 'fullscreen';
      
      return React.createElement(
        'div',
        { 
          style: { 
            fontFamily: 'Quicksand, sans-serif', 
            padding: isFullscreen ? '0' : '2rem', 
            minHeight: '100vh',
            display: isFullscreen ? 'block' : 'flex',
            alignItems: isFullscreen ? 'stretch' : 'center',
            justifyContent: isFullscreen ? 'stretch' : 'center'
          }, 
          className: 'bg-cream w-full h-full' 
        },
        React.createElement(Story)
      );
    },
  ],
};

export default preview;