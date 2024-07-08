import { cwd } from 'node:process'
import { pathToFileURL } from 'node:url'
import { describe, it, expect } from 'vitest'
// @ts-ignore
import { resolve } from '../loader.js'

describe('resolve function', () => {
  const baseURL = pathToFileURL(`${cwd()  }/`).href

  it('should resolve a builtin module', async () => {
    const context = { parentURL: baseURL }
    const next = (specifier: string) => {
      if (specifier === 'fs') {
        return { url: 'node:fs' }
      }
      return null
    }

    const result = await resolve('fs', context, next)
    expect(result).toEqual({ url: 'node:fs' })
  })

  it('should resolve a local module', async () => {
    const context = { parentURL: baseURL }
    const next = (url: any) => ({ url })

    const result = await resolve('vitest', context, next)
    expect(result.url).toContain('vitest')
  })

  it('should throw an error if the module is not found', async () => {
    const context = { parentURL: baseURL }
    const next = (specifier: any) => {
      throw new Error(`Cannot find module '${specifier}'`)
    }

    await expect(resolve('non-existent-module', context, next)).rejects.toThrow('Cannot find module')
  })
})