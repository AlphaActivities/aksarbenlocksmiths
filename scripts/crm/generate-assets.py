"""Deterministic PWA assets from the existing client logo; requires Pillow."""
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[2]
logo=Image.open(root/'public/images/shield-logo.webp').convert('RGBA')
out=root/'public/admin';out.mkdir(exist_ok=True)
bg='#0d152b';card='#172442'
def mark(canvas,size,center):
    tile=Image.new('RGBA',(size,size),card)
    inner=logo.copy();inner.thumbnail((round(size*104/124),round(size*104/124)),Image.Resampling.LANCZOS)
    tile.alpha_composite(inner,((size-inner.width)//2,(size-inner.height)//2))
    from PIL import ImageDraw
    mask=Image.new('L',(size,size));ImageDraw.Draw(mask).rounded_rectangle((0,0,size,size),radius=round(size*16/124),fill=255)
    canvas.paste(tile,(round(center[0]-size/2),round(center[1]-size/2)),mask)
for size,name,fraction in [(192,'icon-192.png',.85),(512,'icon-512.png',.85),(512,'icon-maskable.png',.6),(180,'apple-touch-icon.png',.85)]:
    image=Image.new('RGB',(size,size),bg);mark(image,round(size*fraction),(size/2,size/2));image.save(out/name,optimize=True)
# CSS device geometry and DPR. Portrait only; first frame uses 38% height minus 30 CSS px.
geometries=[(320,568,2),(375,667,2),(414,736,3),(375,812,3),(390,844,3),(393,852,3),(402,874,3),(414,896,2),(414,896,3),(428,926,3),(430,932,3),(440,956,3)]
links=[]
for w,h,dpr in geometries:
    image=Image.new('RGB',(w*dpr,h*dpr),bg);mark(image,124*dpr,(w*dpr/2,(h*.38-30)*dpr));name=f'startup-{w}x{h}@{dpr}.png';image.save(out/name,optimize=True)
    links.append(f'<link rel="apple-touch-startup-image" href="/admin/{name}" media="(device-width: {w}px) and (device-height: {h}px) and (-webkit-device-pixel-ratio: {dpr}) and (orientation: portrait)">')
p=root/'admin/index.html';s=p.read_text();start='<!-- STARTUP_IMAGES -->';end='<!-- /STARTUP_IMAGES -->'
a=s.index(start);b=s.index(end)+len(end) if end in s else a+len(start)
p.write_text(s[:a]+start+'\n'+'\n'.join(links)+'\n'+end+s[b:])
print('Generated 4 icons and',len(geometries),'portrait startup images')
