import { registerProcessBatchInlineCodeCommand } from '../core/bracktick/batchBracktick';
import { registerProcessInlineCodeCommand } from '../core/bracktick/singleBracktick';
import { registerInsertSpaceCommand } from '../core/insertSpace/insertSpace';

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
  registerInsertSpaceCommand()
];