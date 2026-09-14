export interface UniformFit {
  readonly scale: number
  readonly offsetX: number
  readonly offsetY: number
  readonly width: number
  readonly height: number
}

export interface HostSize {
  readonly width: number
  readonly height: number
}

function finiteNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0
}

/**
 * Fits a logical area into a host without changing its aspect ratio.
 * A zero-sized host produces a finite zero scale and never a NaN/Infinity.
 */
export function calculateUniformFit(
  hostWidth: number,
  hostHeight: number,
  logicalWidth: number,
  logicalHeight: number,
): UniformFit {
  const width = finiteNonNegative(hostWidth)
  const height = finiteNonNegative(hostHeight)
  const areaWidth = finiteNonNegative(logicalWidth)
  const areaHeight = finiteNonNegative(logicalHeight)

  if (width === 0 || height === 0 || areaWidth === 0 || areaHeight === 0) {
    return {
      scale: 0,
      offsetX: width / 2,
      offsetY: height / 2,
      width: 0,
      height: 0,
    }
  }

  const scale = Math.min(width / areaWidth, height / areaHeight)
  const fittedWidth = areaWidth * scale
  const fittedHeight = areaHeight * scale

  return {
    scale,
    offsetX: (width - fittedWidth) / 2,
    offsetY: (height - fittedHeight) / 2,
    width: fittedWidth,
    height: fittedHeight,
  }
}

export function measureHost(host: HTMLElement): HostSize {
  const bounds = host.getBoundingClientRect()
  const width = bounds.width || host.clientWidth
  const height = bounds.height || host.clientHeight

  return {
    width: finiteNonNegative(width),
    height: finiteNonNegative(height),
  }
}
