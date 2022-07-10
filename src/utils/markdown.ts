import markedown from 'markdown-it';

const md = new markedown();

export type markdownRender = (str: string) => string;

export function markdownRender(str: string) {
  return md.render(str);
}
