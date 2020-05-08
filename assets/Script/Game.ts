import Block, { Pos } from './Block'

const { ccclass, property } = cc._decorator

@ccclass
export default class Game extends cc.Component {

  @property(cc.Prefab)
  blockPrefab: cc.Prefab = null

  @property(cc.Node)
  puzzleArea: cc.Node = null

  @property(cc.Label)
  stepLabel: cc.Label = null

  private _step: number = 0
  private _puzzleSize: number = 4
  private _puzzleMap: Array<Array<Block>> = []

  get map() {
    return this._puzzleMap
  }

  onLoad() {
    cc.loader.loadRes('img', (err, texture) => {
      if (err) {
        console.error('loadres error ', err)
        return
      }
      this._init(texture)
    })
  }

  private _init(texture: cc.Texture2D) {
    for (let r = 0; r < this._puzzleSize; r++) {
      this._puzzleMap[r] = []
      for (let c = 0; c < this._puzzleSize; c++) {
        const blockNode: cc.Node = cc.instantiate(this.blockPrefab)
        this.puzzleArea.addChild(blockNode)
        const block: Block = blockNode.getComponent(Block)
        block.game = this
        block.init(texture, { x: r, y: c })
        this._puzzleMap[r].push(block)
      }
    }

    this._shuffle()
  }

  private _shuffle(): void {
    for (let r = 0; r < this._puzzleSize; r++) {
      for (let c = 0; c < this._puzzleSize; c++) {
        const i: number = Math.floor(Math.random() * this._puzzleSize)
        const j: number = Math.floor(Math.random() * this._puzzleSize)

        const block: Block = this._puzzleMap[r][c]
        block.changeTo({
          from: { x: r, y: c },
          to: { x: i, y: j },
          pos: block.node.getPosition()
        })
      }
    }
  }

  public checkSuccess(): void {
    this._step++
    this.stepLabel.string = `Step: ${this._step}`
    for (let r = 0; r < this._puzzleSize; r++) {
      for (let c = 0; c < this._puzzleSize; c++) {
        const p: Pos = this._puzzleMap[r][c].pos
        if (p.x !== r || p.y !== c) return
      }
    }

    // restart
    cc.director.loadScene('game')
  }
}
