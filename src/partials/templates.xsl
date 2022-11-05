<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="blank-view">
	<h2>Welcome to Keane.</h2>

	<div class="block-buttons">
		<div class="btn disabled_" data-click="open-filesystem">
			<i class="icon-folder-open"></i>
			Open&#8230;
		</div>

		<div class="btn disabled_" data-click="new-from-clipboard">
			<i class="icon-clipboard"></i>
			From clipboard
		</div>

		<div class="btn" data-click="close-view">
			<i class="icon-cancel"></i>
			Close
		</div>
	</div>

	<div class="block-presets" data-click="select-preset">
		<h3>Presets</h3>
		<xsl:call-template name="preset-list" />
	</div>

	<div class="block-samples" data-click="select-sample">
		<h3>Example</h3>
		<xsl:call-template name="sample-list" />
	</div>

	<xsl:if test="count(./Recents/*) &gt; 0">
		<div class="block-recent" data-click="select-recent-file">
			<h3>Recent</h3>
			<xsl:call-template name="recent-list" />
		</div>
	</xsl:if>
</xsl:template>


<xsl:template name="preset-list">
	<xsl:for-each select="./Presets/*">
		<div class="preset">
			<xsl:attribute name="data-width"><xsl:value-of select="@width"/></xsl:attribute>
			<xsl:attribute name="data-height"><xsl:value-of select="@height"/></xsl:attribute>
			<xsl:attribute name="data-bg"><xsl:value-of select="@bg"/></xsl:attribute>
			<xsl:if test="@icon = 'folder-open'">
				<xsl:attribute name="class">preset fs-open</xsl:attribute>
			</xsl:if>
			<i>
				<xsl:attribute name="class">icon-<xsl:value-of select="@icon"/></xsl:attribute>
			</i>
			<h4><xsl:value-of select="@name"/></h4>
			<xsl:if test="@bg-name">
				<h5><xsl:value-of select="@bg-name"/>, <xsl:value-of select="@width"/>x<xsl:value-of select="@height"/> pixels</h5>
			</xsl:if>
		</div>
	</xsl:for-each>
</xsl:template>


<xsl:template name="sample-list">
	<xsl:for-each select="./Samples/*">
		<div class="sample">
			<xsl:attribute name="style">background-image: url(<xsl:value-of select="@path"/>);</xsl:attribute>
			<xsl:attribute name="data-url"><xsl:value-of select="@path"/></xsl:attribute>
			<span class="sample-kind"><xsl:call-template name="substring-after-last">
				<xsl:with-param name="string" select="@path" />
				<xsl:with-param name="delimiter" select="'.'" />
			</xsl:call-template></span>
		</div>
	</xsl:for-each>
</xsl:template>


<xsl:template name="recent-list">
	<xsl:for-each select="./Recents/*">
		<div class="recent-file">
			<xsl:attribute name="data-file"><xsl:value-of select="@filepath"/></xsl:attribute>
			<span class="thumbnail">
				<xsl:attribute name="style">background-image: url(<xsl:value-of select="@filepath"/>);</xsl:attribute>
			</span>
			<span class="name"><xsl:value-of select="@name"/></span>
		</div>
	</xsl:for-each>
</xsl:template>


<xsl:template name="substring-after-last">
	<xsl:param name="string" />
	<xsl:param name="delimiter" />
	<xsl:choose>
		<xsl:when test="contains($string, $delimiter)">
			<xsl:call-template name="substring-after-last">
				<xsl:with-param name="string" select="substring-after($string, $delimiter)" />
				<xsl:with-param name="delimiter" select="$delimiter" />
			</xsl:call-template>
		</xsl:when>
		<xsl:otherwise><xsl:value-of select="$string" /></xsl:otherwise>
	</xsl:choose>
</xsl:template>


<xsl:template name="layers">
	<xsl:for-each select="//File/Layers/*">
		<xsl:call-template name="single-layer" />
	</xsl:for-each>
</xsl:template>


<xsl:template name="single-layer">
	<div class="row" data-click="select-row">
		<xsl:attribute name="data-id"><xsl:value-of select="@id"/></xsl:attribute>
		<xsl:choose>
			<xsl:when test="./*[@type = 'folder']">
				<div class="icon icon-folder"></div>
			</xsl:when>
			<xsl:when test="./*[@type = 'text']">
				<div class="icon icon-text"></div>
			</xsl:when>
			<xsl:otherwise>
				<div class="thumbnail"><canvas></canvas></div>
			</xsl:otherwise>
		</xsl:choose>
		<div class="name"><xsl:value-of select="@name"/></div>
		<div data-click="toggle-visibility">
			<xsl:attribute name="class">icon
				<xsl:if test="@state = 'hidden'"> icon-eye-off</xsl:if>
				<xsl:if test="@state = 'visible'"> icon-eye-on</xsl:if>
			</xsl:attribute>
		</div>
		<xsl:if test="./Fx"><div class="fx-applied"></div></xsl:if>
	</div>
</xsl:template>


<xsl:template name="channels">
	<div class="row" data-channel="rgb" data-click="select-channel">
		<div class="thumbnail"><canvas></canvas></div>
		<div class="name">RGB</div>
		<div class="icon icon-eye-on" data-click="toggle-rgb-channel"></div>
	</div>
	<div class="row" data-channel="red" data-click="select-channel">
		<div class="thumbnail channel-red"><canvas></canvas></div>
		<div class="name">Red</div>
		<div class="icon icon-eye-on" data-click="toggle-channel"></div>
	</div>
	<div class="row" data-channel="green" data-click="select-channel">
		<div class="thumbnail channel-green"><canvas></canvas></div>
		<div class="name">Green</div>
		<div class="icon icon-eye-on" data-click="toggle-channel"></div>
	</div>
	<div class="row" data-channel="blue" data-click="select-channel">
		<div class="thumbnail channel-blue"><canvas></canvas></div>
		<div class="name">Blue</div>
		<div class="icon icon-eye-on" data-click="toggle-channel"></div>
	</div>
</xsl:template>


<xsl:template name="paths">
	<div class="row">
		<div class="thumbnail"><canvas></canvas></div>
		<div class="name">Name of path</div>
	</div>
</xsl:template>


<xsl:template name="statusbar-tab">
	<div class="file" data-click="select-file">
		<xsl:attribute name="data-arg"><xsl:value-of select="@id"/></xsl:attribute>
		<span><xsl:value-of select="@name"/></span>
		<div class="close" data-click="close-file"></div>
	</div>
</xsl:template>


<xsl:template name="knob">
	<div class="inline-menubox" data-ui="doKnob">
		<div class="inline-content">
			<div class="knob"></div>
		</div>
	</div>
</xsl:template>


<xsl:template name="swatches">
	<div class="inline-menubox" data-ui="doSwatches">
		<div class="inline-content swatches">
			<xsl:for-each select="./*">
				<div class="swatch">
					<xsl:attribute name="style">background: <xsl:value-of select="@value"/>;</xsl:attribute>
				</div>
			</xsl:for-each>
		</div>
	</div>
</xsl:template>


<xsl:template name="blend-modes">
	<div class="inline-menubox" data-ui="doSelectbox">
		<div class="inline-content">
			<xsl:for-each select="./*">
				<xsl:choose>
					<xsl:when test="@type = 'divider'"><hr/></xsl:when>
					<xsl:when test="@type = 'option'">
						<div class="option">
							<xsl:attribute name="data-value"><xsl:choose>
								<xsl:when test="@value"><xsl:value-of select="@value"/></xsl:when>
								<xsl:otherwise><xsl:value-of select="@name"/></xsl:otherwise>
							</xsl:choose></xsl:attribute>
							<xsl:value-of select="@name"/>
						</div>
					</xsl:when>
				</xsl:choose>
			</xsl:for-each>
		</div>
	</div>
</xsl:template>


<xsl:template name="feather-modes">
	<div class="inline-menubox" data-ui="doSelectbox">
		<div class="inline-content">
			<xsl:for-each select="./*">
				<xsl:choose>
					<xsl:when test="@type = 'divider'"><hr/></xsl:when>
					<xsl:when test="@type = 'option'">
						<div class="option">
							<xsl:attribute name="data-value"><xsl:choose>
								<xsl:when test="@value"><xsl:value-of select="@value"/></xsl:when>
								<xsl:otherwise><xsl:value-of select="@name"/></xsl:otherwise>
							</xsl:choose></xsl:attribute>
							<xsl:value-of select="@name"/>
						</div>
					</xsl:when>
				</xsl:choose>
			</xsl:for-each>
		</div>
	</div>
</xsl:template>


<xsl:template name="pop-gradient-strips">
	<div class="inline-menubox" data-ui="doGradients">
		<div class="inline-content gradient-strips" data-click="select-gradient-strip">
			<xsl:for-each select="./*">
				<div class="strip">
					<xsl:if test="position() = 2"><xsl:attribute name="class">strip active</xsl:attribute></xsl:if>
					<xsl:attribute name="style">--gs: <xsl:value-of select="@g"/>;</xsl:attribute>
				</div>
			</xsl:for-each>
			<div class="add-strip" data-click="add-gradient-strip"></div>
		</div>
	</div>
</xsl:template>


<xsl:template name="pop-brush-tips">
	<div class="inline-menubox" data-ui="doBrushTips">
		<div class="inline-content brush-tips">
			<div class="tip-presets">
				<div class="rotation">
					<div class="gyro">
						<div class="handle"></div>
						<div class="handle"></div>
						<div class="direction"></div>
					</div>
				</div>
				<div class="ranges">
					<div class="tip-size">
						<span class="label">Size:</span>
						<span class="value" data-suffix="px">21px</span>
						<input type="range" data-change="tip-menu-set-size" class="mini-range" min="1" max="200" />
					</div>
					<div class="tip-hardness">
						<span class="label">Hardness:</span>
						<span class="value" data-suffix="%">81%</span>
						<input type="range" data-change="tip-menu-set-hardness" class="mini-range" min="0" max="100" />
					</div>
				</div>
			</div>
			<div class="shape-list">
				<xsl:for-each select="./*">
					<div data-click="tip-menu-set-tip">
						<xsl:attribute name="data-name">
							<xsl:value-of select="@name"/>
						</xsl:attribute>
						<xsl:attribute name="class">
							<xsl:if test="@type = 'texture'">texture</xsl:if>
							<xsl:if test="@tip = 'round'"> round</xsl:if>
						</xsl:attribute>
					</div>
				</xsl:for-each>
			</div>
			<div class="preview">
				<canvas></canvas>
			</div>
		</div>
	</div>
</xsl:template>


<xsl:template name="pixelator-preset">
	<xsl:for-each select="./*">
		<xsl:call-template name="pixelator-preset-layer" />
	</xsl:for-each>
</xsl:template>


<xsl:template name="pixelator-preset-layer">
	<xsl:variable name="shape"><xsl:choose>
		<xsl:when test="@shape"><xsl:value-of select="@shape"/></xsl:when>
		<xsl:otherwise>square</xsl:otherwise>
	</xsl:choose></xsl:variable>

	<xsl:variable name="alpha"><xsl:choose>
		<xsl:when test="@alpha"><xsl:value-of select="@alpha * 100"/></xsl:when>
		<xsl:otherwise>100</xsl:otherwise>
	</xsl:choose></xsl:variable>

	<div class="row">
		<div>
			<div class="shape-options" data-click="set-layer-shape">
				<i class="icon-shape-square"><xsl:if test="$shape = 'square'">
					<xsl:attribute name="class">icon-shape-square active</xsl:attribute>
				</xsl:if></i>
				<i class="icon-shape-diamond"><xsl:if test="$shape = 'diamond'">
					<xsl:attribute name="class">icon-shape-diamond active</xsl:attribute>
				</xsl:if></i>
				<i class="icon-shape-circle"><xsl:if test="$shape = 'circle'">
					<xsl:attribute name="class">icon-shape-circle active</xsl:attribute>
				</xsl:if></i>
			</div>
		</div>
		<div data-ux="dlg-knob" data-change="set-spacing" data-min="0" data-max="64" data-suffix="px"><xsl:value-of select="@res"/> <xsl:if test="@res">px</xsl:if></div>
		<div data-ux="dlg-knob" data-change="set-size" data-min="0" data-max="64" data-suffix="px"><xsl:value-of select="@size"/> <xsl:if test="@size">px</xsl:if></div>
		<div data-ux="dlg-knob" data-change="set-offset" data-min="0" data-max="64" data-suffix="px"><xsl:value-of select="@offset"/> <xsl:if test="@offset">px</xsl:if></div>
		<div>
			<i class="icon-bars" data-ux="dlg-bars" data-change="set-opacity">
				<xsl:attribute name="style">--value: <xsl:value-of select="$alpha"/>%;</xsl:attribute>
			</i>
			<i class="icon-eye-on" data-click="toggle-layer"><xsl:if test="@hidden = 1">
				<xsl:attribute name="class">icon-eye-on icon-eye-off</xsl:attribute>
			</xsl:if></i>
			<i class="icon-trashcan" data-click="remove-layer"></i>
		</div>
	</div>
</xsl:template>


<xsl:template name="shapes-list-layer">
	<xsl:for-each select="./Shape"><xsl:call-template name="shape" /></xsl:for-each>
</xsl:template>


<xsl:template name="shape">
	<svg>
		<xsl:if test="@id"><xsl:attribute name="id"><xsl:value-of select="@id"/></xsl:attribute></xsl:if>
		<xsl:attribute name="class">shape <xsl:value-of select="@class"/></xsl:attribute>
		<xsl:attribute name="viewBox"><xsl:value-of select="@viewBox"/></xsl:attribute>
		<xsl:attribute name="style">
			<xsl:value-of select="@style"/>
			width: <xsl:call-template name="getViewboxValue">
						<xsl:with-param name="text" select="@viewBox"/>
						<xsl:with-param name="index" select="3"/>
					</xsl:call-template>px;
			height: <xsl:call-template name="getViewboxValue">
						<xsl:with-param name="text" select="@viewBox"/>
						<xsl:with-param name="index" select="4"/>
					</xsl:call-template>px;
		</xsl:attribute>
		<xsl:value-of select="." disable-output-escaping="yes"/>
	</svg>
</xsl:template>


<xsl:template name="getViewboxValue">
	<xsl:param name="text"/>
	<xsl:param name="index"/>
	<xsl:param name="i" select="1"/>
	<xsl:choose>
		<xsl:when test="$index = $i">
			<xsl:value-of select="substring-before( $text, ' ' )"/>
			<xsl:if test="not( contains( $text, ' ' ) )"><xsl:value-of select="$text"/></xsl:if>
		</xsl:when>
		<xsl:otherwise>
			<xsl:call-template name="getViewboxValue">
				<xsl:with-param name="text" select="substring-after( $text, ' ' )"/>
				<xsl:with-param name="index" select="$index"/>
				<xsl:with-param name="i" select="$i + 1"/>
			</xsl:call-template>
		</xsl:otherwise>
	</xsl:choose>
</xsl:template>

</xsl:stylesheet>
