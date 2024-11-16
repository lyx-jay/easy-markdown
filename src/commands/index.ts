import { registerProcessBatchInlineCodeCommand } from '../core/bracktick/batchBracktick';
import { registerAddWordCommand } from '../core/bracktick/dictionaryBracktick';
import { registerProcessInlineCodeCommand } from '../core/bracktick/singleBracktick';
import { registerInsertSpaceCommand } from '../core/insertSpace/insertSpace';
import formatMarkdown from '../core/format';

export default [
  /**
   * add backtick to single word
   */
  registerProcessInlineCodeCommand(),
  /**
   * add backtick to multiple words
   */
  registerProcessBatchInlineCodeCommand(),
  /**
   * insert space
   */
  registerInsertSpaceCommand(),
  /**
   * add word to dictionary
   */
  registerAddWordCommand(),
  /**
   * formatMarkdown
   */
  formatMarkdown()
];