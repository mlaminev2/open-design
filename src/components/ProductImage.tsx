import { ProductPlaceholder } from './ProductPlaceholder'

interface Props {
  images?: string[]
  slug: string
  alt?: string
  className?: string
  priority?: boolean
  activeIndex?: number
}

export function ProductImage({ images, slug, alt = '', className, priority, activeIndex = 0 }: Props) {
  if (images && images.length > 0) {
    const src = images[activeIndex] ?? images[0]
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        loading={priority ? 'eager' : 'lazy'}
      />
    )
  }
  return <ProductPlaceholder slug={slug} className={className} />
}
