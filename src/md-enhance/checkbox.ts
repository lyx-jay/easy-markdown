import type MarkdownIt from 'markdown-it';
const markdownItCheckbox = (md: MarkdownIt) => {
  const defaultRender = md.renderer.rules.text || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.text = (tokens, idx, options, env, self) => {
    let text = defaultRender(tokens, idx, options, env, self);
    text = text.replace(/\[ ]/g, '<input type="checkbox" >');
    text = text.replace(/\[x]/g, '<input type="checkbox" checked >');
    return text;
  };
};


export default markdownItCheckbox;

