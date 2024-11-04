import type MarkdownIt from 'markdown-it';
import container from 'markdown-it-container';
import type { RenderRule } from 'markdown-it/lib/renderer.mjs';

type ContainerType =  "tip" | "info" | "warning" | "danger" | "details";

const customBlockStyle = (type: ContainerType) => {
  const map:Record<ContainerType, string> = {
    tip: 'color: rgba(255, 255, 245, .86);background-color: rgba(100, 108, 255, .16)',
    info: 'color: rgba(255, 255, 245, .86);background-color: rgba(101, 117, 133, .16)',
    warning: 'color: rgba(255, 255, 245, .86);background-color: rgba(234, 179, 8, .16)',
    danger: 'color: rgba(255, 255, 245, .86);background-color: rgba(244, 63, 94, .16)',
    details: 'color: rgba(255, 255, 245, .86);background-color: rgba(101, 117, 133, .16)'
  };
   const base =  `
    border: 1px solid transparent;
    border-radius: 8px;
    line-height: 24px;
    font-size: 14px;
    margin: 16px 0;
    padding: 16px 16px 8px;
  `;
  return base + map[type];
};




export const containerPlugin = (
  md: MarkdownIt,
  options: any,
  containerOptions?: ContainerOptions
) => {
  md.use(...createContainer('tip', containerOptions?.tipLabel || 'TIP', md))
    .use(...createContainer('info', containerOptions?.infoLabel || 'INFO', md))
    .use(
      ...createContainer(
        'warning',
        containerOptions?.warningLabel || 'WARNING',
        md
      )
    )
    .use(
      ...createContainer(
        'danger',
        containerOptions?.dangerLabel || 'DANGER',
        md
      )
    )
    .use(
      ...createContainer(
        'details',
        containerOptions?.detailsLabel || 'Details',
        md
      )
    );
    // explicitly escape Vue syntax
    // .use(container, 'v-pre', {
    //   render: (tokens: Token[], idx: number) =>
    //     tokens[idx].nesting === 1 ? `<div v-pre>\n` : `</div>\n`
    // })
    // .use(container, 'raw', {
    //   render: (tokens: Token[], idx: number) =>
    //     tokens[idx].nesting === 1 ? `<div class="vp-raw">\n` : `</div>\n`
    // });

    // .use(...createCodeGroup(options, md));

};

type ContainerArgs = [typeof container, string, { render: RenderRule }];

function createContainer(
  klass: ContainerType,
  defaultTitle: string,
  md: MarkdownIt
): ContainerArgs {
  return [
    container,
    klass,
    {
      render(tokens, idx, _options, env: any) {
        const token = tokens[idx];
        const info = token.info.trim().slice(klass.length).trim();
        const attrs = md.renderer.renderAttrs(token);
        if (token.nesting === 1) {
          const title = md.renderInline(info || defaultTitle, {
            references: env.references
          });
          if (klass === 'details')
            {return `<details style="${customBlockStyle(klass)}" class="${klass} custom-block"${attrs}><summary style="margin: 0 0 8px 0">${title}</summary>\n`;}
          return `<div class="${klass} custom-block"${attrs} style="${customBlockStyle(klass)}"><p class="custom-block-title">${title}</p>\n`;
        } else {return klass === 'details' ? `</details>\n` : `</div>\n`;}
      }
    }
  ];
}

// function createCodeGroup(options: Options, md: MarkdownIt): ContainerArgs {
//   return [
//     container,
//     'code-group',
//     {
//       render(tokens, idx) {
//         if (tokens[idx].nesting === 1) {
//           const name = nanoid(5);
//           let tabs = '';
//           let checked = 'checked';

//           for (
//             let i = idx + 1;
//             !(
//               tokens[i].nesting === -1 &&
//               tokens[i].type === 'container_code-group_close'
//             );
//             ++i
//           ) {
//             const isHtml = tokens[i].type === 'html_block';

//             if (
//               (tokens[i].type === 'fence' && tokens[i].tag === 'code') ||
//               isHtml
//             ) {
//               const title = extractTitle(
//                 isHtml ? tokens[i].content : tokens[i].info,
//                 isHtml
//               );

//               if (title) {
//                 const id = nanoid(7);
//                 tabs += `<input type="radio" name="group-${name}" id="tab-${id}" ${checked}><label data-title="${md.utils.escapeHtml(title)}" for="tab-${id}">${title}</label>`;

//                 if (checked && !isHtml) {tokens[i].info += ' active';}
//                 checked = '';
//               }
//             }
//           }

//           return `<div class="vp-code-group${getAdaptiveThemeMarker(
//             options
//           )}"><div class="tabs">${tabs}</div><div class="blocks">\n`;
//         }
//         return `</div></div>\n`;
//       }
//     }
//   ];
// }

export interface ContainerOptions {
  infoLabel?: string
  noteLabel?: string
  tipLabel?: string
  warningLabel?: string
  dangerLabel?: string
  detailsLabel?: string
  importantLabel?: string
  cautionLabel?: string
}