export enum InstrumentEventEnum {
    m5_closed, m15_closed, m30_closed, h1_closed, h4_closed, d_closed,

    m5_line_break_closed, m15_line_break_closed, m30_line_break_closed, h1_line_break_closed,
    h4_line_break_closed, d_line_break_closed,

    m5_heikin_ashi_closed, m15_heikin_ashi_closed, m30_heikin_ashi_closed, h1_heikin_ashi_closed,
    h4_heikin_ashi_closed, d_heikin_ashi_closed,

    m5_dmi_changed, m15_dmi_changed, m30_dmi_changed, h1_dmi_changed, h4_dmi_changed,
    d_dmi_changed,

    m5_heikin_ashi_dmi_changed, m15_heikin_ashi_dmi_changed, m30_heikin_ashi_dmi_changed,
    h1_heikin_ashi_dmi_changed, h4_heikin_ashi_dmi_changed, d_heikin_ashi_dmi_changed,

    m5_line_break_dmi_changed, m15_line_break_dmi_changed, m30_line_break_dmi_changed,
    h1_line_break_dmi_changed, h4_line_break_dmi_changed, d_line_break_dmi_changed,

    m5_rsi_changed, m15_rsi_changed, m30_rsi_changed, h1_rsi_changed, h4_rsi_changed,
    d_rsi_changed,

    m5_heikin_ashi_rsi_changed, m15_heikin_ashi_rsi_changed, m30_heikin_ashi_rsi_changed,
    h1_heikin_ashi_rsi_changed, h4_heikin_ashi_rsi_changed, d_heikin_ashi_rsi_changed,

    m5_line_break_rsi_changed, m15_line_break_rsi_changed, m30_line_break_rsi_changed,
    h1_line_break_rsi_changed, h4_line_break_rsi_changed, d_line_break_rsi_changed,

    m5_macd_changed, m15_macd_changed, m30_macd_changed, h1_macd_changed, h4_macd_changed,
    d_macd_changed,

    m5_heikin_ashi_macd_changed, m15_heikin_ashi_macd_changed, m30_heikin_ashi_macd_changed,
    h1_heikin_ashi_macd_changed, h4_heikin_ashi_macd_changed, d_heikin_ashi_macd_changed,

    m5_line_break_macd_changed, m15_line_break_macd_changed, m30_line_break_macd_changed,
    h1_line_break_macd_changed, h4_line_break_macd_changed, d_line_break_macd_changed,

    m5_sma_changed, m15_sma_changed, m30_sma_changed, h1_sma_changed, h4_sma_changed,
    d_sma_changed,

    m5_heikin_ashi_sma_changed, m15_heikin_ashi_sma_changed, m30_heikin_ashi_sma_changed,
    h1_heikin_ashi_sma_changed, h4_heikin_ashi_sma_changed, d_heikin_ashi_sma_changed,

    m5_line_break_sma_changed, m15_line_break_sma_changed, m30_line_break_sma_changed,
    h1_line_break_sma_changed, h4_line_break_sma_changed, d_line_break_sma_changed,

    m5_ema_changed, m15_ema_changed, m30_ema_changed, h1_ema_changed, h4_ema_changed,
    d_ema_changed,

    m5_heikin_ashi_ema_changed, m15_heikin_ashi_ema_changed, m30_heikin_ashi_ema_changed,
    h1_heikin_ashi_ema_changed, h4_heikin_ashi_ema_changed, d_heikin_ashi_ema_changed,

    m5_line_break_ema_changed, m15_line_break_ema_changed, m30_line_break_ema_changed,
    h1_line_break_ema_changed, h4_line_break_ema_changed, d_line_break_ema_changed,
}
