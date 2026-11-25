// 연락처 사진: 루티(투명 PNG) 또는 사진을 크림색 정사각형 JPG로  — swift avatar.swift in.png out.jpg [photo]
import AppKit
let a = CommandLine.arguments
let src = NSImage(contentsOfFile: a[1])!
let isPhoto = a.count > 3
let S: CGFloat = 400
let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(S), pixelsHigh: Int(S), bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
NSColor(red: 1, green: 0.965, blue: 0.937, alpha: 1).setFill()
NSRect(x: 0, y: 0, width: S, height: S).fill()
let w = src.size.width, h = src.size.height
var r: NSRect
if isPhoto { let k = max(S / w, S / h); r = NSRect(x: (S - w * k) / 2, y: (S - h * k) / 2, width: w * k, height: h * k) }
else { let k = min(S * 0.8 / w, S * 0.8 / h); r = NSRect(x: (S - w * k) / 2, y: (S - h * k) / 2, width: w * k, height: h * k) }
src.draw(in: r)
NSGraphicsContext.restoreGraphicsState()
try! rep.representation(using: .jpeg, properties: [.compressionFactor: 0.82])!.write(to: URL(fileURLWithPath: a[2]))
