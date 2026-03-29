'use client';
import PathCard from '@/components/PathCard';
import { useLanguage } from '@/components/LanguageContext';
import styles from '@/app/page.module.css';

export default function PartnershipSection() {
    const { t } = useLanguage();

    return (
        <section className={styles.greatEnglishSection}>
            <div className="container">
                <div className={styles.greatEnglishCard}>
                    <div className={styles.geBadge}>{t('partner.badge')}</div>
                    <h2 className={styles.geTitle}>{t('partner.title')}</h2>
                    <p className={styles.geDesc}>{t('partner.desc')}</p>

                    <div className={styles.gePathHeader}>
                        <h3 className={styles.gePathTitle}>{t('partner.choosePath')}</h3>

                        <div className={styles.geGrid}>
                            <PathCard
                                title={t('partner.learn.title')}
                                description={t('partner.learn.desc')}
                                list={[
                                    t('partner.learn.i1'),
                                    t('partner.learn.i2'),
                                    t('partner.learn.i3'),
                                    t('partner.learn.i4'),
                                ]}
                                ctaText={t('partner.learn.cta')}
                                ctaHref="https://wa.me/628211704707"
                                variant="secondary"
                            />

                            <PathCard
                                title={t('partner.teach.title')}
                                description={t('partner.teach.desc')}
                                list={[
                                    t('partner.teach.i1'),
                                    t('partner.teach.i2'),
                                    t('partner.teach.i3'),
                                ]}
                                ctaText={t('partner.teach.cta')}
                                ctaHref="https://wa.me/628211704707"
                                variant="primary"
                            />
                        </div>

                        <div className={styles.geStatusWrapper}>
                            <span className={styles.geStatusBadge}>
                                {t('partner.preEnrol')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
