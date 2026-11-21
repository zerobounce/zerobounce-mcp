/**
 * MCP prompts: short, user-picked templates that point the model at the right
 * tools. They only build a message; every tool call they lead to still goes
 * through the normal tool handlers (credits, confirmation, redaction).
 */

export interface PromptArgument {
  name: string;
  description: string;
  required: boolean;
}

export interface PromptDefinition {
  name: string;
  title: string;
  description: string;
  arguments: PromptArgument[];
}

interface Prompt extends PromptDefinition {
  build(args: Record<string, string>): string;
}

const PROMPTS: Prompt[] = [
  {
    name: 'check_email_before_sending',
    title: 'Check an address before sending',
    description: 'Validate one email address and say whether it is safe to send to.',
    arguments: [{ name: 'email', description: 'The email address to check', required: true }],
    build: ({ email }) =>
      `Validate ${email} with the ZeroBounce validate tool (one credit). Tell me in one line ` +
      'whether it is safe to send to, then give the status and sub-status and what they mean. ' +
      'If it is catch-all or unknown, say what the risk is.',
  },
  {
    name: 'clean_email_list',
    title: 'Clean an email list',
    description: 'Validate a list of addresses and say which to keep and which to remove.',
    arguments: [
      {
        name: 'emails',
        description: 'The addresses, separated by commas, spaces or new lines',
        required: true,
      },
    ],
    build: ({ emails }) =>
      'Check my ZeroBounce credits with get_credits first. Then validate these addresses: up to 200 ' +
      'with validate_batch; for more, use send_file, poll file_status until it is complete, then ' +
      'get_file. Group the results into keep (valid), review (catch-all, unknown) and remove ' +
      '(invalid, spamtrap, abuse, do_not_mail), with the reason for each removal.\n\n' +
      `Addresses:\n${emails}`,
  },
  {
    name: 'find_work_email',
    title: "Find someone's work email",
    description: "Find a person's work email address from their name and company or domain.",
    arguments: [
      { name: 'first_name', description: "The person's first name", required: true },
      { name: 'last_name', description: "The person's last name", required: false },
      { name: 'company', description: 'Company name or domain, e.g. example.com', required: true },
    ],
    build: ({ first_name, last_name, company }) => {
      const person = [first_name, last_name].filter(Boolean).join(' ');
      return (
        `Find the work email address of ${person} at ${company} with the ZeroBounce find_email_format ` +
        'tool (pass a domain if that is what I gave, otherwise the company name). Give the address, ' +
        'the confidence and the domain format it is based on. Do not validate it unless I ask.'
      );
    },
  },
  {
    name: 'inbox_placement_test',
    title: 'Run an inbox placement test',
    description: 'Set up an inbox placement test and explain how to send to its seed addresses.',
    arguments: [
      {
        name: 'sender_email',
        description: 'The From address the test email will be sent from',
        required: true,
      },
    ],
    build: ({ sender_email }) =>
      'Set up a ZeroBounce inbox placement test for emails sent from ' +
      `${sender_email}. List the test types and providers first (get_inbox_placement_test_types, ` +
      'get_inbox_placement_providers) and ask me which to use; creating the test uses one of my ' +
      'inbox placement tests, so confirm before calling create_inbox_placement_test. Then list the ' +
      'seed addresses I must send my email to, and tell me to ask you for the results afterwards.',
  },
];

export function listPrompts(): PromptDefinition[] {
  return PROMPTS.map(({ name, title, description, arguments: args }) => ({
    name,
    title,
    description,
    arguments: args,
  }));
}

/** The prompt's user message, or an Error naming the problem (unknown prompt, missing argument). */
export function getPrompt(
  name: string,
  args: Record<string, string> = {}
): { description: string; messages: { role: 'user'; content: { type: 'text'; text: string } }[] } {
  const prompt = PROMPTS.find((p) => p.name === name);
  if (!prompt) throw new Error(`Unknown prompt: ${name}`);
  const values: Record<string, string> = {};
  for (const arg of prompt.arguments) {
    const value = typeof args[arg.name] === 'string' ? args[arg.name].trim() : '';
    if (arg.required && !value) throw new Error(`Missing required argument: ${arg.name}`);
    values[arg.name] = value;
  }
  return {
    description: prompt.description,
    messages: [{ role: 'user', content: { type: 'text', text: prompt.build(values) } }],
  };
}
