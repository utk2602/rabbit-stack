// ALL INTERFACE FOR RADIO COMPONENT
export interface RadioProps {
  width?: number
  height?: number
  time?: number[]
  actionOneText?: string
  actionTwoText?: string
  onActionOneClick?: () => void
  onActionTwoClick?: () => void
}

export interface ActionButtonProps {
  className?: string
  playAction?: boolean
  type?: "primary" | "secondary"
  text?: string
  onClick?: () => void
}

export interface Song {
  title: string
  artist?: string
  url: string
}

export interface MusicPlayerProps {
  songs: Song[]
  targetDate?: string | Date
  actionOneText?: string
  actionTwoText?: string
  onActionOneClick?: () => void
  onActionTwoClick?: () => void
}

// ALL INTERFACE FOR HERO SECTION COMPONENTS
export interface Tile {
  x: number
  y: number
  width: number
  height: number
  rotationX: number
  image: HTMLImageElement | null
  imageIndex: number
  isAnimating: boolean
  opacity: number
  lastFlipTime: number
}

export interface Canvas2DFlippingGridProps {
  gridCount?: number
  boxSize?: number
  boxDepth?: number
  faceColor?: string
  sideColor?: string
  scrollHeight?: string
  imageFolder?: string
  imageCount?: number
  extension?: string
  BackgroundComponent?: React.ComponentType
  flipCooldown?: number
  maxConcurrentFlips?: number
  queueDelay?: number
}

export interface Box {
  x: number
  y: number
  z: number
  order: number
  rotation: { x: number; y: number; z: number }
  opacity: number
}

export interface Point {
  x: number
  y: number
}

export interface Face {
  tl: Point
  tr: Point
  bl: Point
  br: Point
}

export interface Canvas3DGridProps {
  gridCount?: number
  boxSize?: number
  boxDepth?: number
  faceColor?: string
  sideColor?: string
  scrollHeight?: string
  BackgroundComponent?: React.ComponentType
}
