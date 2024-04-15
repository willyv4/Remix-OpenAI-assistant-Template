// Copied from openai internals
export interface FunctionDefinition {
  /**
   * The name of the function to be called. Must be a-z, A-Z, 0-9, or contain
   * underscores and dashes, with a maximum length of 64.
   */
  name: string;

  /**
   * A description of what the function does, used by the model to choose when and
   * how to call the function.
   */
  description?: string;

  /**
   * The parameters the functions accepts, described as a JSON Schema object. See the
   * [guide](https://platform.openai.com/docs/guides/text-generation/function-calling)
   * for examples, and the
   * [JSON Schema reference](https://json-schema.org/understanding-json-schema/) for
   * documentation about the format.
   *
   * Omitting `parameters` defines a function with an empty parameter list.
   */
  parameters?: { [x: string]: unknown };
}

export const model = "gpt-3.5-turbo";

export const instructions = `You are a general bot`;

export const file_ids = [];

type AssistantToolCode = {
  type: 'code_interpreter';
};

type AssistantToolRetrieval = {
  type: 'retrieval';
};

type AssistantToolFunction = {
  type: 'function';
  function: FunctionDefinition;
};

export type AssistantTool =
  | AssistantToolCode
  | AssistantToolRetrieval
  | AssistantToolFunction;

// pass params for dynamic functions
export const assistantFunctions = (params?: any): AssistantTool[] => {
  return [
    { type: 'retrieval' },
    { type: 'function', function: testFunction },
  ];
};

export const testFunction: FunctionDefinition = {
  name: 'testFunction',
  description: 'please return a string mentioning you are running the test function.',
  parameters: {
    type: 'object',
    properties: {
      testFunction: {
        type: 'string',
      },
    },
    required: ['testFunction'],
  },
};
