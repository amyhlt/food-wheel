export default function TestImage() {
    const testUrls = [
      'https://picsum.photos/id/108/200/200',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200',
      'https://source.unsplash.com/featured/200x200?food'
    ]
  
    return (
      <div style={{ padding: 20 }}>
        <h1>测试图片源</h1>
        {testUrls.map((url, i) => (
          <div key={i} style={{ marginBottom: 20 }}>
            <img src={url} width={200} height={200} alt="test" />
            <p>{url}</p>
          </div>
        ))}
      </div>
    )
  }