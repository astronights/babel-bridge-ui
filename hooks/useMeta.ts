'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { MetaResponse, LanguageMeta, LevelMeta } from '@/types'

let _cache: MetaResponse | null = null

export function useMeta() {
  const [meta, setMeta] = useState<MetaResponse | null>(_cache)

  useEffect(() => {
    if (_cache) return
    api.meta.get().then(m => {
      _cache = m
      setMeta(m)
    }).catch(() => {})
  }, [])

  function getLanguage(displayName: string): LanguageMeta | undefined {
    return meta?.languages.find(l => l.display_name === displayName)
  }

  function getLevel(code: string): LevelMeta | undefined {
    return meta?.levels.find(l => l.code === code)
  }

  function getSpeechCode(displayName: string): string {
    return getLanguage(displayName)?.speech_code ?? 'en-US'
  }

  function getNativeSymbol(displayName: string): string {
    return getLanguage(displayName)?.native_symbol ?? ''
  }

  function getRomanSymbol(displayName: string): string {
    return getLanguage(displayName)?.roman_symbol ?? ''
  }

  function getDefaultScenario(levelCode: string, langCode: string): string {
    const level = getLevel(levelCode)
    if (!level) return ''
    return level.scenarios?.[langCode] ?? level.default_scenario
  }

  return { meta, getLanguage, getLevel, getSpeechCode, getNativeSymbol, getRomanSymbol, getDefaultScenario }
}