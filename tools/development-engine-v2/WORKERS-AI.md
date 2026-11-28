# Workers AI proposal execution

`createProposalExecutor` uses the Workers AI binding and accepts either of the two approved models. It produces a proposal only. A proposal is not evidence that an implementation, deployment or test occurred. Keep the independent verifier in control of task completion.

Keep live execution disabled until the target account is verified on Workers Free. The Cloudflare plan is the provider-side spending boundary. The executor additionally requires a task-data policy, limits output to 512 tokens per call and caps calls per batch, including failed calls. The cap applies to a single executor instance. No credentials, repository contents or client records are supplied by the adapter. The caller must approve the instruction text for inference.

Run `node --test tools/development-engine-v2/*.test.mjs` for the controller and binding contract tests. The tests use a mock binding and consume no inference.

## Live inference verification
Record the model identifier, request count, reported Neurons, and the GitHub verification run. Store evidence in Alpha Dev after the run succeeds. Keep prompts and credentials out of the verification record.
