// @flow

import type { RenderContext } from "../types"

export const renderContext = { value: null }

const useRenderContext = (): RenderContext => {
  return renderContext.value
}

export default useRenderContext
