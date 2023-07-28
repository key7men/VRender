import type { IBoundsLike } from '@visactor/vutils';
import { merge } from '@visactor/vutils';
import { LabelBase } from './base';
import type { ArcLabelAttrs, IPoint, Quadrant, TextAlign } from './type';
import type { BaseLabelAttrs } from './type';
import type { ITextGraphicAttribute, TextAlignType, TextBaselineType } from '@visactor/vrender';
import { isValidNumber, isNil, isLess, isGreater, isNumberClose as isClose } from '@visactor/vutils';
import {
  circlePoint,
  isQuadrantRight,
  isQuadrantLeft,
  lineCirclePoints,
  connectLineRadian,
  checkBoundsOverlap,
  degrees
} from './util';
import { ARC_K, ARC_MIDDLE_ANGLE, ARC_QUADRANT, ARC_RADIAN } from './constant';
import type { IGraphic } from '@visactor/vrender';

export class ArcInfo {
  key!: string;
  refDatum!: any;
  /**
   * 绘图区圆弧中点
   */
  center!: IPoint;
  /**
   * label起始区圆弧中点
   */
  outerCenter!: IPoint;
  labelSize!: { width: number; height: number };
  labelPosition!: IPoint;
  labelLimit: number;
  labelVisible: boolean;
  lastLabelY!: number;
  labelYRange!: [number, number];
  labelText!: string | string[];
  pointA!: IPoint;
  pointB!: IPoint;
  pointC!: IPoint;
  /**
   * 象限
   */
  quadrant: Quadrant;
  radian: number;
  middleAngle: number;
  k: number;
  textAlign: TextAlignType;
  textBaseline: TextBaselineType;
  angle: number;

  constructor(
    refDatum: any,
    center: IPoint,
    outerCenter: IPoint,
    quadrant: Quadrant,
    radian: number,
    middleAngle: number,
    k: number
  ) {
    this.refDatum = refDatum;
    this.center = center;
    this.outerCenter = outerCenter;
    this.quadrant = quadrant;
    this.radian = radian;
    this.middleAngle = middleAngle;
    this.k = k;
    this.labelVisible = true;
    this.labelLimit = 0;
  }

  getLabelBounds(): IBoundsLike {
    if (!this.labelPosition || !this.labelSize) {
      return { x1: 0, x2: 0, y1: 0, y2: 0 };
    }
    return {
      x1: this.labelPosition.x - this.labelSize.width / 2,
      y1: this.labelPosition.y - this.labelSize.height / 2,
      x2: this.labelPosition.x + this.labelSize.width / 2,
      y2: this.labelPosition.y + this.labelSize.height / 2
    };
  }
}

type PriorityArc = {
  arc: ArcInfo;
  /**
   * 在初始 arc 数组中的索引
   */
  originIndex: number;
  priorityIndex: number;
};

export class ArcLabel extends LabelBase<ArcLabelAttrs> {
  name = 'arc-label';

  static defaultAttributes: Partial<ArcLabelAttrs> = {
    // visible: true,
    // showRule: 'all',
    // rotate: true,
    coverEnable: false,
    spaceWidth: 5,
    layoutArcGap: 6,
    textStyle: {
      visible: true,
      fontSize: 14,
      fontWeight: 'normal',
      fillOpacity: 1
    },
    position: 'outside',
    offset: 0,
    line: {
      visible: true,
      line1MinLength: 20,
      line2MinLength: 10
    },
    layout: {
      align: 'arc',
      strategy: 'priority',
      tangentConstraint: true
    }
  };

  private _ellipsisWidth: number = 0;

  private _arcLeft: Map<any, ArcInfo> = new Map();
  private _arcRight: Map<any, ArcInfo> = new Map();

  constructor(attributes: ArcLabelAttrs) {
    super(merge({}, ArcLabel.defaultAttributes, attributes));
  }

  protected labeling(
    textBounds: IBoundsLike,
    graphicBounds: IBoundsLike,
    position = 'outside',
    offset = 0,
    graphicAttributes: any,
    textData: any,
    width: number,
    height: number,
    attribute: any
  ): Partial<ITextGraphicAttribute> | undefined {
    if (!textBounds || !graphicBounds) {
      return;
    }

    // setArcs : 根据 arc 设置 datum 中对应的标签数据
    const radiusRatio = this.computeLayoutOuterRadius(graphicAttributes.outerRadius, width, height);
    const radius = this.computeRadius(radiusRatio, width, height);
    const center = attribute.center ?? { x: 0, y: 0 };

    const item = textData;

    const arcMiddle = circlePoint(center.x, center.y, radius * item[ARC_K], item[ARC_MIDDLE_ANGLE]);

    const outerArcMiddle = circlePoint(
      center.x,
      center.y,
      radius + attribute.line.line1MinLength,
      item[ARC_MIDDLE_ANGLE]
    );

    const arc = new ArcInfo(
      item,
      arcMiddle,
      outerArcMiddle,
      item[ARC_QUADRANT],
      item[ARC_RADIAN],
      item[ARC_MIDDLE_ANGLE],
      item[ARC_K]
    );

    // refDatum: any,
    // center: IPoint,
    // outerCenter: IPoint,
    // quadrant: Quadrant,
    // radian: number,
    // middleAngle: number,
    // k: number

    arc.pointA = circlePoint(
      (center as IPoint).x,
      (center as IPoint).y,
      this.computeDatumRadius(center.x * 2, center.y * 2, graphicAttributes.outerRadius),
      arc.middleAngle
    );

    arc.labelSize = {
      width: textBounds.x2 - textBounds.x1,
      height: textBounds.y2 - textBounds.y1
    };
    if (isQuadrantRight(arc.quadrant)) {
      arc.textAlign = 'left';
      arc.textBaseline = 'bottom';
      this._arcRight.set(arc.refDatum, arc);
    } else if (isQuadrantLeft(arc.quadrant)) {
      arc.textAlign = 'right';
      arc.textBaseline = 'bottom';
      this._arcLeft.set(arc.refDatum, arc);
    }

    return { arcRight: this._arcRight, arcLeft: this._arcLeft };
  }

  // layoutLabels : 执行内部/外部标签的布局计算
  protected layoutArcLabels(position: BaseLabelAttrs['position'], attribute: any, currentMarks?: IGraphic[]) {
    const leftArcs = Array.from(this._arcLeft.values());
    const rightArcs = Array.from(this._arcRight.values());
    const arcs: ArcInfo[] = [];
    if (position === 'inside') {
      arcs.push(...this._layoutInsideLabels(rightArcs, attribute, currentMarks));
      arcs.push(...this._layoutInsideLabels(leftArcs, attribute, currentMarks));
    } else {
      arcs.push(...this._layoutOutsideLabels(rightArcs, attribute, currentMarks));
      arcs.push(...this._layoutOutsideLabels(leftArcs, attribute, currentMarks));
    }
    return arcs;
  }

  /**
   * 布局内部标签
   */
  private _layoutInsideLabels(arcs: ArcInfo[], attribute: any, currentMarks: IGraphic[]) {
    const center = attribute.center ?? { x: 0, y: 0 };
    const innerRadiusRatio = this.computeLayoutOuterRadius(
      currentMarks[0].attribute.innerRadius,
      attribute.width,
      attribute.height
    );
    const outerRadiusRatio = this.computeLayoutOuterRadius(
      currentMarks[0].attribute.outerRadius,
      attribute.width,
      attribute.height
    );
    const labelConfig = attribute;
    const spaceWidth = labelConfig.spaceWidth as number;

    arcs.forEach((arc: ArcInfo) => {
      const { labelSize, radian } = arc;
      const innerRadius = this.computeRadius(innerRadiusRatio, attribute.width, attribute.height, 1);
      const outerRadius = this.computeRadius(outerRadiusRatio, attribute.width, attribute.height, 1);
      const minRadian = connectLineRadian(outerRadius, labelSize.height);
      let limit;
      if (radian < minRadian) {
        limit = 0;
      } else {
        let minRadius;
        if (radian >= Math.PI) {
          minRadius = innerRadius;
        } else {
          minRadius = Math.max(innerRadius, labelSize.height / 2 / Math.tan(radian / 2));
        }
        limit = outerRadius - minRadius - spaceWidth;
      }
      // TODO: 对于不旋转的内部标签设置 limit 为 outerRadius
      if (labelConfig?.rotate !== true) {
        limit = outerRadius - spaceWidth;
      }
      const text = this._getFormatLabelText(arc.refDatum, limit);
      arc.labelText = text;
      const labelWidth = Math.min(limit, arc.labelSize.width);
      const align = this._computeAlign(arc, attribute);
      const alignOffset = align === 'left' ? labelWidth : align === 'right' ? 0 : labelWidth / 2;
      const labelRadius = outerRadius - spaceWidth - alignOffset;
      arc.labelPosition = circlePoint((center as IPoint).x, (center as IPoint).y, labelRadius, arc.middleAngle);
      arc.labelLimit = labelWidth;
      if (!isGreater(labelWidth, 0)) {
        arc.labelVisible = false;
      }
      (arc.textAlign = 'center'), (arc.textBaseline = 'middle');

      //   arc.angle = degrees(arc.middleAngle);
      arc.angle = arc.middleAngle;
    });
    return arcs;
  }

  /**
   * 布局外部标签
   */
  private _layoutOutsideLabels(arcs: ArcInfo[], attribute: any, currentMarks: IGraphic[]) {
    // const height = Math.min(attribute.center.x, attribute.center.y) * 2;
    const height = attribute.center.y * 2;
    const line2MinLength = attribute.line.line2MinLength as number;
    const labelLayout = attribute.layout;
    const spaceWidth = attribute.spaceWidth as number;

    arcs.forEach(arc => {
      const direction = isQuadrantLeft(arc.quadrant) ? -1 : 1;
      arc.labelPosition = {
        x: arc.outerCenter.x + direction * (arc.labelSize.width / 2 + line2MinLength + spaceWidth),
        y: arc.outerCenter.y
      };
    });
    arcs.sort((a, b) => {
      return a.labelPosition.y - b.labelPosition.y;
    });

    if (attribute.coverEnable !== false || labelLayout.strategy === 'none') {
      for (const arc of arcs) {
        const { labelPosition, labelSize } = arc;
        arc.labelLimit = labelSize.width;
        arc.pointB = isQuadrantLeft(arc.quadrant)
          ? {
              x: labelPosition.x + labelSize.width / 2 + line2MinLength + spaceWidth,
              y: labelPosition.y
            }
          : {
              x: labelPosition.x - labelSize.width / 2 - line2MinLength - spaceWidth,
              y: labelPosition.y
            };
        this._computeX(arc, attribute, currentMarks);
      }
      if (attribute.coverEnable === false && labelLayout.strategy === 'none') {
        this._coverLabels(arcs);
      }
    } else {
      // 由于可能存在多行标签，这里仅仅估计一个最大标签数量用于避免冗余计算
      const maxLabels = height / ((attribute.textStyle?.fontSize as number) || 16);
      // 布局圆弧半径
      this._adjustY(arcs, maxLabels, attribute, currentMarks);

      const { minY, maxY } = arcs.reduce(
        (yInfo, arc) => {
          const { y1, y2 } = arc.getLabelBounds();
          yInfo.minY = Math.max(0, Math.min(y1, yInfo.minY));
          yInfo.maxY = Math.min(height, Math.max(y2, yInfo.maxY));
          return yInfo;
        },
        { minY: Infinity, maxY: -Infinity }
      );
      const halfY = Math.max(Math.abs(height / 2 - minY), Math.abs(maxY - height / 2));
      // pointB 与 label 的 y 值相同，但是 label 的 x 值依赖于 pointB 的 x 值
      const r = this._computeLayoutRadius(halfY, attribute, currentMarks);
      for (const arc of arcs) {
        this._computePointB(arc, r, attribute, currentMarks);
        this._computeX(arc, attribute, currentMarks);
      }
    }
    const width = attribute.center.x * 2;
    arcs.forEach(arc => {
      if (
        arc.labelVisible &&
        (isLess(arc.pointB.x, line2MinLength + spaceWidth) ||
          isGreater(arc.pointB.x, width - line2MinLength - spaceWidth))
      ) {
        arc.labelVisible = false;
      }
      arc.angle = 0;
    });
    return arcs;
  }

  /**
   * 计算 pointC 以及 label limit 与 position
   */
  private _computeX(arc: ArcInfo, attribute: any, currentMarks: IGraphic[]) {
    const center = attribute.center ?? { x: 0, y: 0 };
    const plotLayout = { width: attribute.center.x * 2, height: attribute.center.y * 2 };
    const radiusRatio = this.computeLayoutOuterRadius(
      currentMarks[0].attribute.outerRadius,
      attribute.width,
      attribute.height
    );

    const line1MinLength = attribute.line.line1MinLength as number;
    const line2MinLength = attribute.line.line2MinLength as number;
    const labelLayoutAlign = attribute.layout?.align;
    const spaceWidth = attribute.spaceWidth as number;
    const align = this._computeAlign(arc, attribute) as TextAlign;

    const { labelPosition, quadrant, pointB } = arc;
    if (!isValidNumber(pointB.x * pointB.y)) {
      arc.pointC = { x: NaN, y: NaN };
      labelPosition.x = NaN;
      arc.labelLimit = 0;
    }
    const radius = this.computeRadius(radiusRatio, attribute.width, attribute.height);
    const flag = isQuadrantLeft(quadrant) ? -1 : 1;
    let cx: number = 0;
    const restWidth = flag > 0 ? plotLayout.width - pointB.x : pointB.x;
    let limit = restWidth - line2MinLength - spaceWidth;
    if (labelLayoutAlign === 'labelLine') {
      cx = (radius + line1MinLength + line2MinLength) * flag + (center as IPoint).x;
      limit = (flag > 0 ? plotLayout.width - cx : cx) - spaceWidth;
    }
    const text = this._getFormatLabelText(arc.refDatum, limit);
    arc.labelText = text;
    let labelWidth = Math.min(limit, arc.labelSize.width);
    switch (labelLayoutAlign) {
      case 'labelLine':
        break;
      case 'edge':
        cx = flag > 0 ? plotLayout.width - labelWidth - spaceWidth : labelWidth + spaceWidth;
        break;
      case 'arc':
      default:
        cx = pointB.x + flag * line2MinLength;
        break;
    }
    labelWidth = Math.max(this._ellipsisWidth, labelWidth);
    arc.pointC = { x: cx, y: labelPosition.y };

    if (labelLayoutAlign === 'edge') {
      // edge 模式下的多行文本对齐方向与其他模式相反
      const alignOffset = this._computeAlignOffset(align, labelWidth, -flag);
      // 贴近画布边缘的布局结果可能会由于 cx 的小数 pixel 导致被部分裁剪，因此额外做计算
      labelPosition.x = flag > 0 ? plotLayout.width + alignOffset : alignOffset;
    } else {
      const alignOffset = this._computeAlignOffset(align, labelWidth, flag);
      labelPosition.x = cx + alignOffset + flag * spaceWidth;
    }

    arc.labelLimit = labelWidth;
  }

  private _computeAlignOffset(align: TextAlign, labelWidth: number, alignFlag: number): number {
    switch (align) {
      case 'left':
        return alignFlag < 0 ? -labelWidth : 0;
      case 'right':
        return alignFlag < 0 ? 0 : labelWidth;
      case 'center':
      default:
        return (labelWidth / 2) * alignFlag;
    }
  }

  private _computeAlign(arc: ArcInfo, attribute: any) {
    const labelConfig = attribute;
    // 暂时兼容两种配置方式
    const textAlign = labelConfig.textStyle?.textAlign ?? labelConfig.textStyle?.align;
    const layoutAlign = labelConfig.layout?.textAlign ?? labelConfig.layout?.align;
    if (labelConfig.position !== 'inside') {
      if (isNil(textAlign) || textAlign === 'auto') {
        // edge 模式下沿着画布对齐，与 labelLine & edge 模式相反
        if (layoutAlign === 'edge') {
          return isQuadrantLeft(arc.quadrant) ? 'left' : 'right';
        }
        return isQuadrantLeft(arc.quadrant) ? 'right' : 'left';
      }
      return textAlign;
    }
    return isNil(textAlign) || textAlign === 'auto' ? 'center' : textAlign;
  }

  private _getFormatLabelText(value: any, limit?: number) {
    return value.text;
  }

  /**
   * 调整标签位置的 Y 值
   */
  private _adjustY(arcs: ArcInfo[], maxLabels: number, attribute: any, currentMarks: any) {
    const plotRect = { width: attribute.center.x * 2, height: attribute.center.y * 2 };
    const labelLayout = attribute.layout;
    if (labelLayout.strategy === 'vertical') {
      // vertical 策略类似 echarts 方案，没有切线限制策略，没有优先级，执行整体调整没有标签数量限制
      let lastY = 0;
      let delta;
      const len = arcs.length;
      if (len <= 0) {
        return;
      }
      // 偏移 y 值以避免遮挡
      for (let i = 0; i < len; i++) {
        const { y1 } = arcs[i].getLabelBounds();
        delta = y1 - lastY;
        if (isLess(delta, 0)) {
          const index = this._shiftY(arcs, i, len - 1, -delta);
          this._shiftY(arcs, index, 0, delta / 2);
        }
        const { y2 } = arcs[i].getLabelBounds();
        lastY = y2;
      }
      // 将超出上界的标签下移
      const { y1: firstY1 } = arcs[0].getLabelBounds();
      delta = firstY1 - 0;
      if (isLess(delta, 0)) {
        this._shiftY(arcs, 0, len - 1, -delta);
      }
      for (let i = arcs.length - 1; i >= 0; i--) {
        if (arcs[i].getLabelBounds().y2 > plotRect.height) {
          arcs[i].labelVisible = false;
        } else {
          break;
        }
      }
    } else if (labelLayout.strategy !== 'none') {
      const priorityArcs: PriorityArc[] = arcs.map((arc, i) => {
        return {
          arc,
          originIndex: i,
          priorityIndex: 0
        };
      });
      priorityArcs.sort((a, b) => {
        return b.arc.radian - a.arc.radian;
      });
      priorityArcs.forEach((priorityArc, i) => {
        priorityArc.priorityIndex = i;
        // 首先隐藏所有标签
        priorityArc.arc.labelVisible = false;
      });

      let topLabelIndex = Infinity;
      let bottomLabelIndex = -Infinity;
      // 按照优先级依次布局标签
      for (let i = 0; i < maxLabels && i < arcs.length; i++) {
        this._storeY(arcs);
        const arc = priorityArcs[i].arc;
        this._computeYRange(arc, attribute, currentMarks);
        arc.labelVisible = true;
        const curY = arc.labelPosition.y;
        // 寻找标签在布局前垂直方向上的上下邻居，也就是饼图上的邻居关系
        const { lastIndex, nextIndex } = this._findNeighborIndex(arcs, priorityArcs[i]);
        const lastArc = arcs[lastIndex];
        const nextArc = arcs[nextIndex];
        if (lastIndex === -1 && nextIndex !== -1) {
          const nextY = nextArc.labelPosition.y;
          if (curY > nextY) {
            arc.labelPosition.y = nextY - nextArc.labelSize.height / 2 - arc.labelSize.height / 2;
          } else {
            this._twoWayShift(arcs, arc, nextArc, nextIndex);
          }
        } else if (lastIndex !== -1 && nextIndex === -1) {
          const lastY = lastArc.labelPosition.y;
          if (curY < lastY) {
            arc.labelPosition.y = lastY + lastArc.labelSize.height / 2 + arc.labelSize.height / 2;
          } else {
            this._twoWayShift(arcs, lastArc, arc, priorityArcs[i].originIndex);
          }
        } else if (lastIndex !== -1 && nextIndex !== -1) {
          const lastY = lastArc.labelPosition.y;
          const nextY = nextArc.labelPosition.y;
          if (curY > nextY) {
            arc.labelPosition.y = nextY - nextArc.labelSize.height / 2 - arc.labelSize.height / 2;
            this._twoWayShift(arcs, lastArc, arc, priorityArcs[i].originIndex);
          } else if (curY < lastY) {
            arc.labelPosition.y = lastY + lastArc.labelSize.height / 2 + arc.labelSize.height / 2;
            this._twoWayShift(arcs, arc, nextArc, nextIndex);
          } else {
            this._twoWayShift(arcs, lastArc, arc, priorityArcs[i].originIndex);
            this._twoWayShift(arcs, arc, nextArc, nextIndex);
          }
        }

        const nextTopIndex = Math.min(topLabelIndex, priorityArcs[i].originIndex);
        const nextBottomIndex = Math.max(bottomLabelIndex, priorityArcs[i].originIndex);
        let delta;
        // 将超出下界的标签上移
        delta = arcs[nextBottomIndex].getLabelBounds().y2 - plotRect.height;
        if (isGreater(delta, 0)) {
          this._shiftY(arcs, nextBottomIndex, 0, -delta);
        }
        // 将超出上界的标签下移
        delta = arcs[nextTopIndex].getLabelBounds().y1 - 0;
        if (isLess(delta, 0)) {
          this._shiftY(arcs, nextTopIndex, arcs.length - 1, -delta);
        }
        delta = arcs[nextBottomIndex].getLabelBounds().y2 - plotRect.height;
        // 当整体上下移一次之后仍然无法容纳所有标签，则当前标签应当舍去
        if (isGreater(delta, 0)) {
          arc.labelVisible = false;
          this._restoreY(arcs);
          break;
        } else if (labelLayout.tangentConstraint && !this._checkYRange(arcs)) {
          // 当标签由于 Y 方向调节范围过大而舍弃时不应当终止布局过程
          arc.labelVisible = false;
          this._restoreY(arcs);
        } else {
          topLabelIndex = nextTopIndex;
          bottomLabelIndex = nextBottomIndex;
        }
      }
    }
  }

  /**
   * 向某一方向调整局部标签的 Y 值
   */
  private _shiftY(arcs: ArcInfo[], start: number, end: number, delta: number) {
    const direction = start < end ? 1 : -1;
    let index = start;
    while (index !== -1) {
      arcs[index].labelPosition.y += delta;
      const nextIndex = this._findNextVisibleIndex(arcs, index, end, direction);
      if (nextIndex >= 0 && nextIndex < arcs.length) {
        const { y1: curY1, y2: curY2 } = arcs[index].getLabelBounds();
        const { y1: nextY1, y2: nextY2 } = arcs[nextIndex].getLabelBounds();
        if ((direction > 0 && curY2 < nextY1) || (direction < 0 && curY1 > nextY2)) {
          return index;
        }
      }
      index = nextIndex;
    }
    return end;
  }

  /**
   * 寻找下一个显示标签索引
   */
  private _findNextVisibleIndex(arcs: ArcInfo[], start: number, end: number, direction: number) {
    const diff = (end - start) * direction;
    for (let i = 1; i <= diff; i++) {
      const index = start + i * direction;
      if (arcs[index].labelVisible) {
        return index;
      }
    }
    return -1;
  }

  /**
   * 计算 pointB，其 y 值在 adjustY 中确定，也即是 label 的 y 值
   */
  private _computePointB(arc: ArcInfo, r: number, attribute: any, currentMarks: any) {
    const labelConfig = attribute;
    const radiusRatio = this.computeLayoutOuterRadius(
      currentMarks[0].attribute.outerRadius,
      attribute.width,
      attribute.height
    );
    const line1MinLength = labelConfig.line.line1MinLength as number;
    const labelLayout = labelConfig.layout;

    if (labelLayout.strategy === 'none') {
      // 不执行躲避策略或者不显示引导线时紧挨着圆弧布局
      arc.pointB = {
        x: arc.outerCenter.x,
        y: arc.outerCenter.y
      };
    } else {
      const center = attribute.center ?? { x: 0, y: 0 };
      const radius = this.computeRadius(radiusRatio, attribute.width, attribute.height);
      const { labelPosition, quadrant } = arc;
      const outerR = Math.max(radius + line1MinLength, currentMarks[0].attribute.outerRadius);
      const rd = r - outerR;
      // x 为 pointB.x 与圆心的差值
      const x = Math.sqrt(r ** 2 - Math.abs((center as IPoint).y - labelPosition.y) ** 2) - rd;
      if (isValidNumber(x)) {
        arc.pointB = {
          x: (center as IPoint).x + x * (isQuadrantLeft(quadrant) ? -1 : 1),
          y: labelPosition.y
        };
      } else {
        arc.pointB = { x: NaN, y: NaN };
      }
    }
  }

  /**
   * 存储当前所有显示标签的 Y 值
   */
  private _storeY(arcs: ArcInfo[]) {
    for (const arc of arcs) {
      if (arc.labelVisible) {
        arc.lastLabelY = arc.labelPosition.y;
      }
    }
  }

  /**
   * 计算圆弧切线所限制的标签 Y 值范围
   */
  private _computeYRange(arc: ArcInfo, attribute: any, currentMarks: any) {
    const plotRect = { width: attribute.center.x * 2, height: attribute.center.y * 2 };

    const radiusRatio = this.computeLayoutOuterRadius(
      currentMarks[0].attribute.outerRadius,
      attribute.width,
      attribute.height
    );
    const line1MinLength = attribute.line.line1MinLength as number;

    const { width, height } = plotRect;

    const radius = this.computeRadius(radiusRatio, attribute.width, attribute.height);
    // 出现 y 方向挤压过度必然是由于画布上下某一端被占满，此时半径是确定的
    const r = this._computeLayoutRadius(height / 2, attribute, currentMarks);
    // 所有坐标转化到以圆心为原点的坐标系计算
    // 在饼图上左右计算对称，可以全都转化到右侧计算
    const cx = Math.abs(arc.center.x - width / 2);
    const cy = arc.center.y - height / 2;
    let a;
    let b;
    let c;
    if (isClose(width / 2, cx)) {
      a = 0;
      b = 1;
      c = -cy;
    } else if (isClose(height / 2, cy)) {
      a = 1;
      b = 0;
      c = -cx;
    } else {
      // 斜截式转为一般式
      const k = -1 / (cy / cx);
      a = k;
      b = -1;
      c = cy - k * cx;
    }
    const points = lineCirclePoints(a, b, c, line1MinLength + radius - r, 0, r);
    // 由于饼图上切点在布局圆内部，交点必然有两个
    if (points.length < 2) {
      return;
    }
    let min;
    let max;
    if (points[0].x > points[1].x) {
      points.reverse();
    }
    if (points[0].x < 0) {
      if (isClose(points[0].y, points[1].y)) {
        if (Math.abs(arc.middleAngle) < Math.PI / 2) {
          min = 0;
          max = points[1].y + height / 2;
        } else {
          min = points[1].y + height / 2;
          max = height;
        }
      } else if (points[0].y < points[1].y) {
        min = 0;
        max = points[1].y + height / 2;
      } else {
        min = points[1].y + height / 2;
        max = plotRect.height;
      }
    } else {
      min = Math.min(points[0].y, points[1].y) + height / 2;
      max = Math.max(points[0].y, points[1].y) + height / 2;
    }
    arc.labelYRange = [min, max];
  }

  /**
   * 计算标签布局圆弧半径，即 pointB 所落在的圆弧
   */
  private _computeLayoutRadius(halfYLength: number, attribute: any, currentMarks: any) {
    const labelConfig = attribute;
    const layoutArcGap = labelConfig.layoutArcGap as number;
    const line1MinLength = labelConfig.line.line1MinLength as number;
    const radiusRatio = this.computeLayoutOuterRadius(
      currentMarks[0].attribute.outerRadius,
      attribute.width,
      attribute.height
    );
    const radius = this.computeRadius(radiusRatio, attribute.width, attribute.height);
    const outerR = radius + line1MinLength;

    const a = outerR - layoutArcGap;

    return Math.max((a ** 2 + halfYLength ** 2) / (2 * a), outerR);
  }

  /**
   * 依据初始的标签排序，寻找某一标签上下最近的显示标签索引
   */
  private _findNeighborIndex(arcs: ArcInfo[], priorityArc: PriorityArc) {
    const index = priorityArc.originIndex;
    let lastIndex = -1;
    let nextIndex = -1;
    for (let i = index - 1; i >= 0; i--) {
      if (arcs[i].labelVisible) {
        lastIndex = i;
        break;
      }
    }
    for (let i = index + 1; i < arcs.length; i++) {
      if (arcs[i].labelVisible) {
        nextIndex = i;
        break;
      }
    }
    return {
      lastIndex,
      nextIndex
    };
  }

  /**
   * 执行给定标签 Y 值的 shiftDown 以及 shiftUp
   */
  private _twoWayShift(arcs: ArcInfo[], lastArc: ArcInfo, nextArc: ArcInfo, nextIndex: number) {
    const delta = nextArc.getLabelBounds().y1 - lastArc.getLabelBounds().y2;
    if (isLess(delta, 0)) {
      const i = this._shiftY(arcs, nextIndex, arcs.length - 1, -delta);
      this._shiftY(arcs, i, 0, delta / 2);
    }
  }

  /**
   * 恢复所有显示标签在之前存储的 Y 值
   */
  private _restoreY(arcs: ArcInfo[]) {
    for (const arc of arcs) {
      if (arc.labelVisible) {
        arc.labelPosition.y = arc.lastLabelY;
      }
    }
  }

  /**
   * 检查每个显示的标签的 Y 值是否在切线限制范围内
   */
  private _checkYRange(arcs: ArcInfo[]) {
    for (const arc of arcs) {
      const { labelYRange, labelPosition } = arc;
      if (
        arc.labelVisible &&
        labelYRange &&
        (isLess(labelPosition.y, labelYRange[0]) || isGreater(labelPosition.y, labelYRange[1]))
      ) {
        return false;
      }
    }
    return true;
  }

  /**
   * 自上至下计算被遮盖的标签
   */
  private _coverLabels(arcs: ArcInfo[]) {
    if (arcs.length <= 1) {
      return;
    }
    let lastBounds = arcs[0].getLabelBounds();
    for (let i = 1; i < arcs.length; i++) {
      const bounds = arcs[i].getLabelBounds();
      if (!checkBoundsOverlap(lastBounds, bounds)) {
        lastBounds = bounds;
      } else {
        arcs[i].labelVisible = false;
      }
    }
  }

  protected computeRadius(r: number, width?: number, height?: number, k?: number): number {
    return this.computeLayoutRadius(width ? width : 0, height ? height : 0) * r * (isNil(k) ? 1 : k);
  }

  protected computeLayoutRadius(width: number, height: number) {
    return Math.min(width / 2, height / 2);
  }

  private computeLayoutOuterRadius(r: number, width: number, height: number) {
    return r / (Math.min(width, height) / 2);
  }

  private computeDatumRadius(width?: number, height?: number, outerRadius?: any): number {
    const outerRadiusRatio = this.computeLayoutOuterRadius(outerRadius, width, height); //this.getRadius(state)
    return this.computeLayoutRadius(width ? width : 0, height ? height : 0) * outerRadiusRatio;
  }
}