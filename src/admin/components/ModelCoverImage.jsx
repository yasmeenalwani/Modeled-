import ResolvedProfileImage from '../../components/profile/ResolvedProfileImage';

const fallbackStyle = {
  width: '100%',
  height: '100%',
  background: 'linear-gradient(135deg, #e94560, #ff6b8a)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2rem',
  fontWeight: '700',
  color: '#fff',
};

/** Admin gallery card cover — resolves S3 keys before display. */
export default function ModelCoverImage({ photoRef, name, style, alt }) {
  return (
    <ResolvedProfileImage
      photoRef={photoRef}
      name={name}
      style={style}
      alt={alt}
      fallbackStyle={fallbackStyle}
    />
  );
}
