export class PlanLimitError extends Error {
  constructor(reason: string) {
    super(reason)
    this.name = 'PlanLimitError'
  }
}
