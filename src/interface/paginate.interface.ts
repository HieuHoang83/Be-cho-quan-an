export interface PaginateInfo {
  offset: number
  defaultLimit: number
  sort: string
  projection: string
  population: string
  filter: any
  currentPage: number
}