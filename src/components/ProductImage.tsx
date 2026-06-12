import { ProductPlaceholder } from './ProductPlaceholder'

interface Props {
  images?: string[]
  slug: string
  alt?: string
  className?: string
  priority?: boolean
}

export function ProductImage({ images, slug, alt = '', className, priority }: Props) {
  if (images && images.length > 0) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={images[0]}
        alt={alt}
        className={className}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        loading={priority ? 'eager' : 'lazy'}
      />
    )
  }
  return <ProductPlaceholder slug={slug} className={className} />
}
