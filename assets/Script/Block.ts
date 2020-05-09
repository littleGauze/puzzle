import Game from './Game'

const { ccclass, property } = cc._decorator

export interface Pos {
  x: number,
  y: number
}

@ccclass
export default class Block extends cc.Component {

  private _blockSize: number = 180
  private _lastPos: cc.Vec2 = null

  public pos: Pos = null
  public game: Game = null

  onLoad() {
    this.node.on('touchstart', this._onStart, this)
    this.node.on('touchmove', this._onMove, this)
    this.node.on('touchend', this._onEnd, this)
  }

  onDestroy() {
    this.node.off('touchstart', this._onStart, this)
    this.node.off('touchmove', this._onMove, this)
    this.node.off('touchend', this._onEnd, this)
  }

  public init(texture: cc.Texture2D , pos: Pos): void {
    this.pos = pos
    const x: number = pos.x * this._blockSize
    const y: number = pos.y * this._blockSize
    const sp: cc.SpriteFrame = new cc.SpriteFrame(texture, cc.rect(x, y, this._blockSize, this._blockSize))
    this.getComponent(cc.Sprite).spriteFrame = sp
    this.node.x = x
    this.node.y = -y
  }

  _onStart(evt: cc.Event.EventTouch): void {
    this._lastPos = this.node.getPosition()
    this.node.zIndex = 1
  }

  _onMove(evt: cc.Event.EventTouch): void {
    this.node.x += evt.getDeltaX()
    this.node.y += evt.getDeltaY()
  }

  _onEnd(evt: cc.Event.EventTouch): void {
    this.node.zIndex = 0
    this._checkExchange()
  }

  private _checkExchange(): void {
    if (this.node.x > 720) {
      return this.node.setPosition(this._lastPos)
    }

    const i: number = Math.floor(Math.abs(this._lastPos.x) / this._blockSize)
    const j: number = Math.floor(Math.abs(this._lastPos.y) / this._blockSize)
    const li: number = Math.floor(Math.abs(this.node.x + this._blockSize / 2) / this._blockSize)
    const lj: number = Math.floor(Math.abs(this.node.y - this._blockSize / 2) / this._blockSize)
    
    this.changeTo({ from: { x: i, y: j }, to: { x: li, y: lj }, pos: this._lastPos })

    // check success
    this.game.checkSuccess()
  }

  public changeTo({ from, to, pos }: { from: Pos, to: Pos, pos: cc.Vec2 }): void {
    // change node position
    const block: Block = this.game.map[to.x][to.y]
    const target: cc.Vec2 = block.node.getPosition()
    this.node.setPosition(target)
    block.node.setPosition(pos)

    // change map position
    this.game.map[to.x][to.y] = this
    this.game.map[from.x][from.y] = block
  }
}
